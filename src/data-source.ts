import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Post, User } from './entity';
import { Init1687996574398 } from './migration/1687996574398-init';
import { UpdatePost1687997083735 } from './migration/1687997083735-update-post';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'admin',
  password: '123456',
  database: 'reddit-clone',
  synchronize: true,
  logging: false,
  entities: [User, Post],
  migrations: [Init1687996574398, UpdatePost1687997083735],
  migrationsTableName: 'migrations',
});
