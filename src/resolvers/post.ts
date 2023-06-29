import { Post } from '../entity';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuthenticated } from '../middleware/isAuthenticated';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  body: string;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.body.slice(0, 50);
  }

  @Query(() => [Post])
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { dataSource }: MyContext
  ): Promise<Post[]> {
    const realLimit = Math.min(20, limit);

    const builder = dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .limit(realLimit)
      .orderBy('"createdAt"', 'DESC');

    if (cursor) {
      builder.where('"createdAt" < :cursor', { cursor: new Date(cursor) });
    }

    return builder.getMany();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => String) id: string): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuthenticated)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      userId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: string,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('body', () => String, { nullable: true }) body: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title, body });
    }

    const updatedPost = await Post.findOne({ where: { id } });
    return updatedPost;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: string): Promise<Boolean> {
    const post = await Post.findOne({ where: { id } });

    if (post) {
      await Post.delete(id);
      return true;
    }
    return false;
  }
}
