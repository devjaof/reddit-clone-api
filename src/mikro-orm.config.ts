import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core"
import path from "path";
import { User } from "./entities/User";

const entities = [Post, User];
const dbName ='reddit-clone';
const host = 'localhost';
const port = 5432;
const type = 'postgresql';
const user = 'postgres';
const password = 'root';
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
  host,
  port,
  debug: !__prod__,
  allowGlobalContext: true
} as Parameters<typeof MikroORM.init>[0];