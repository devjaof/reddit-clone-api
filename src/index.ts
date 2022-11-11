import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  const post = orm.em.create(Post, {title: 'Meu primeiro post loco de bão'});
  await orm.em.persistAndFlush(post);

  await orm.em.nativeInsert(Post, {title: 'Segundo post só pra vê'});
}

main().catch(err => console.log(err));