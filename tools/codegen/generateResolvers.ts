import fromQuery from "@gql2ts/from-query";
import * as gqlSchema from "scuttlespace-service-user-graphql-schema";
import schema from "../../src/schema";

const camelCase = require("camelcase");

const fixedSchema = gqlSchema.typeDefs
  .replace("extend type Query", "type Query")
  .replace("extend type Mutation", "type Mutation");

let output = "";
output += `import { ApolloClient } from "apollo-client";`;
output += `import gql from "graphql-tag";`;
output += `import queries from "./queries";`;
output += "\n\n";

const mutations: any = queries.mutations;
if (mutations) {
  for (const key of Object.keys(queries.mutations)) {
    const interfaces: string[] = [];
    const generated = fromQuery(
      fixedSchema,
      mutations[key],
      {},
      {
        interfaceBuilder: (name: string, body: string) => {
          interfaces.push(name);
          const interfaceName = `I${name}`;
          output += `export interface ${interfaceName}`;
          output += body;
        }
      }
    );

    output += "\n";

    const invokeFunctionName = `invoke${camelCase(key, { pascalCase: true })}`;
    const invokeFunctionText = `
    export async function ${invokeFunctionName}(
      input: I${interfaces[0]},
      apolloClient: ApolloClient<any>
    ): Promise<I${interfaces[1]}> {
      try {
        const result = await apolloClient.mutate({
          mutation: gql(queries.mutations.${key}),
          variables: input.args
        });
        return result.data as any;
      } catch (ex) {
        throw ex;
      }
    }
    `;
    output += invokeFunctionText;
    output += "\n";
  }
}
console.log(output);
