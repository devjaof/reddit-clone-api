import "reflect-metadata";

import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import mikroConfig from "./mikro-orm.config";
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import  express from "express";
import { UserResolver } from "./resolvers/user";
import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });
  await redisClient.connect();
  
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true,
        disableTTL: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__ // cookie only works in https
      },
      secret: "dsaçldsakdçsad",
      resave: false,
      saveUninitialized: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground()
    ],
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
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
