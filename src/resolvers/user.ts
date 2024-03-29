import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { v4 } from 'uuid';

import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entity';
import { MyContext } from '../types';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { validateIsValidEmail } from '../utils/validateIsValidEmail';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 4) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'A nova senha é menor que 4 caracteres.',
          },
        ],
      };
    }

    const key = `${FORGET_PASSWORD_PREFIX}${token}`;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token expirado',
          },
        ],
      };
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Usuário não existe mais.',
          },
        ],
      };
    }

    await User.update(
      { id: user.id },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return true;
    }

    const token = v4();

    redis.set(
      `${FORGET_PASSWORD_PREFIX}${token}`,
      user.id,
      'EX',
      60 * 60 * 24 /* 24 horas */
    );

    const body = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`;
    await sendEmail(email, body, 'Reset password');

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // usuário não está logado;
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne({ where: { id: req.session.userId } });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    let user!: User;
    try {
      user = await User.create({
        username: options.username,
        password: await argon2.hash(options.password),
        email: options.email,
      }).save();
    } catch (e) {
      if (e.code === '23505' || e.detail?.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already taken',
            },
          ],
        };
      }

      return {
        errors: e,
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const where = validateIsValidEmail(usernameOrEmail)
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail };
    const user = await User.findOne({ where });

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'Usuário não encontrado.',
          },
        ],
      };
    }

    const isValidPassword = await argon2.verify(user.password, password);

    if (!isValidPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Senha incorreta.',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((e) => {
        res.clearCookie(COOKIE_NAME);
        if (e) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
