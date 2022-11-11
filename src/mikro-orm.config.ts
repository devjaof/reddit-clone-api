import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Post";

export default {
  entities: [Post],
  dbName: 'redditclone',
  type: 'mysql',
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];