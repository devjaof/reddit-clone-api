import "reflect-metadata";
import mikroConfig from "./mikro-orm.config";
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import  express from "express";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  })

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4400, () => {
    console.log("Server running on localhost:4400");
  })
};

main().catch(e => {
  console.error(e);
});
