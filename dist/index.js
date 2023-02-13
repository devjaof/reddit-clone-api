"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const core_1 = require("@mikro-orm/core");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const express_1 = __importDefault(require("express"));
const user_1 = require("./resolvers/user");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, post_1.PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.listen(4400, () => {
        console.log("Server running on localhost:4400");
    });
};
main().catch(e => {
    console.error(e);
});
//# sourceMappingURL=index.js.map