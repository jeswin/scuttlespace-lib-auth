import * as graphqlToTS from "graphql-to-ts";
import * as gqlSchema from "scuttlespace-service-user-graphql-schema";

console.log(graphqlToTS.getTypes(gqlSchema.schema));
