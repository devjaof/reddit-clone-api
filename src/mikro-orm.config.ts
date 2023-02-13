import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core"

const entities = [Post];
const dbName ='reddit-clone';
const type = 'postgresql';
const user = 'reddit-clone';
const password = 'postgres';
const migrationPath = "./migrations";

export default {
  migrations: {
    path: migrationPath,
    glob: '!(*.d).{js,ts}',
  },
  entities,
  dbName,
  type,
  user,
  password,
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];