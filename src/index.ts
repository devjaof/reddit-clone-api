import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
  console.log(mikroConfig)
  const orm = await MikroORM.init(mikroConfig);

  // const post = orm.em.create(Post, { title: 'my first post' });
  // await orm.em.persistAndFlush(post);
};

main().catch(e => {
  console.error(e);
});

console.log("Server running...")