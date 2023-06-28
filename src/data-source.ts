import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "admin",
  password: "123456",
  database: "reddit-clone",
  synchronize: true,
  logging: false,
  entities: ["../entity/index{.js,.ts}"],
  migrations: ["../migration/index{.js.ts}"],
  migrationsTableName: "migrations",
});
