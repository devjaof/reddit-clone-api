import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Ctx, Query } from "type-graphql";

export class PostResolver {
 @Query(() => [Post])
 posts(@Ctx() { em }: MyContext): Promise<Post[]> {
  return em.find(Post, {});
 }
}