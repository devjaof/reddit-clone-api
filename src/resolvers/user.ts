import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

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

export class UserResolver {
  @Query(() => User, { nullable: true }) 
  async me(@Ctx() { req, em }: MyContext) {
    console.log(req.session)
    // significa que não está logado, resolver treta dos cookie
    if(!req.session.userId) {
      return null
    }

    return await em.findOne(User, { id: req.session.userId });
  }

  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Query(() => User, { nullable: true })
  user(
    @Arg("id", () => ID) id: string,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username must be at least 2 characters",
          },
        ],
      };
    }

    if (options.password.length < 3) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be at least 3 characters",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
      req.session.userId = user.id;
      return { user };
    } catch (error) {
      if (error.code === "23505" || error.details.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "this username is already in use",
            },
          ],
        };
      }
      return {
        errors: [
          {
            field: "username",
            message: error.message,
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that user doesn't exists",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid password",
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
  logout(
    @Ctx() {req, res}: MyContext
  ) {
    return new Promise((resolve) => req.session.destroy((err) => {
      res.clearCookie(COOKIE_NAME);

      if (err) {
        console.error(err);
        resolve(false);
        return;
      }
      resolve(true);
    }))
  }
}
