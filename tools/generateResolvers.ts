import * as graphqlToTS from "graphql-to-ts";
import { ITSInterface } from "graphql-to-ts";
import prettier = require("prettier");
import gqlSchema from "scuttlespace-service-user-graphql-schema";

const types = graphqlToTS.getTypes(gqlSchema);

const query = types.interfaces.find(x => x.name === "IQuery");
const mutation = types.interfaces.find(x => x.name === "IMutation");

const handlersFile = "./user";
const typesModule = "scuttlespace-service-user-graphql-schema";

const allTypes = types.interfaces
  .filter(x => !["IQuery", "IMutation"].includes(x.name))
  .map(x => x.name)
  .sort();

const allMethods = ((query && query.fields) || [])
  .map(x => x.name)
  .concat(((mutation && mutation.fields) || []).map(x => x.name))
  .sort();

type IResolverTypes = [string, ITSInterface | undefined];

const resolverTypes: IResolverTypes[] = [
  ["Mutation", mutation],
  ["Query", query]
];

const output = `
  import { parseServiceResult } from "scuttlespace-service-common";
  import { ${allTypes.join(",")} } from "${typesModule}";
  import { ${allMethods.join(",")} } from "${handlersFile}";

  export default {
    ${resolverTypes
      .map(
        ([prop, queryOrMutation]) => `
        ${prop}: {
          ${
            queryOrMutation
              ? queryOrMutation.fields
                  .map(
                    f => `
                      async ${f.name}(
                        root: any,
                        args: {
                          ${
                            f.arguments && f.arguments.length
                              ? f.arguments
                                  .map(
                                    a =>
                                      `${a.name}: ${graphqlToTS.typeToString(
                                        a.type
                                      )}`
                                  )
                                  .join(",")
                              : ""
                          }
                        },          
                        context: any
                      ): Promise<${graphqlToTS.typeToString(f.type)}> {
                        const result = await ${f.name}(args, context);
                        return await parseServiceResult(result);
                      }
                    `
                  )
                  .join(",")
              : ""
          }
        }
      `
      )
      .join(",")}
  };
`;

console.log(prettier.format(output, { parser: "typescript" }));
