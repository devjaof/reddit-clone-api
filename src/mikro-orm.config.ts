import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core"
import path from "path";

const entities = [Post];
const dbName ='reddit-clone';
const type = 'postgresql' as const;
const user = 'reddit-clone';
const password = 'postgres';
const migrationPath = path.join(__dirname, "./migrations");

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
  debug: !__prod__,
  allowGlobalContext: true
} as Parameters<typeof MikroORM.init>[0];