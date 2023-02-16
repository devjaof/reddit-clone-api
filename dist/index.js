"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_core_1 = require("apollo-server-core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const core_1 = require("@mikro-orm/core");
const constants_1 = require("./constants");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const express_1 = __importDefault(require("express"));
const user_1 = require("./resolvers/user");
const redis_1 = require("redis");
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redisClient = (0, redis_1.createClient)({ legacyMode: true });
    app.use((0, express_session_1.default)({
        name: 'COOKIE_NAME',
        store: new RedisStore({
            client: redisClient,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.__prod__,
            domain: constants_1.__prod__ ? ".codeponder.com" : undefined,
        },
        saveUninitialized: false,
        secret: 'process.env.SESSION_SECRET',
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, post_1.PostResolver],
            validate: false
        }),
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()
        ],
        context: ({ req, res }) => ({ em: orm.em, req, res })
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    await redisClient.connect();
    redisClient.on("error", console.error);
    app.listen(4400, () => {
        console.log("Server running on localhost:4400");
    });
};
main().catch(e => {
    console.error(e);
});
//# sourceMappingURL=index.js.map