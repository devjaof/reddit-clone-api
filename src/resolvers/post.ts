import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, ID, Mutation, Query } from "type-graphql";

export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => ID) id: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => ID) id: string,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Post)
  async deletePost(
    @Arg("id", () => ID) id: string,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    // const post = await em.findOne(Post, {id});
    // if(!post) {
    //   return null;
    // }
    await em.nativeDelete(Post, { id });
    return true;
    // return post;
  }
}
