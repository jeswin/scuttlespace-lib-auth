const gqlSchema = require("../dist/gql-schema");
const fromSchema = require("@gql2ts/from-schema");

console.log(
  fromSchema.schemaToInterfaces(
    gqlSchema.typeDefs,
    {},
    {
      interfaceBuilder(name, body) {
        if (
          ![
            "IGraphQLResponseRoot",
            "IGraphQLResponseError",
            "IGraphQLResponseErrorLocation"
          ].includes(name)
        ) {
          return `export interface ${name} ${body} `;
        }
      }
    }
  )
);
