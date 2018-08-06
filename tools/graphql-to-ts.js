const gqlSchema = require("../dist/graphql/schema");
const fromSchema = require("@gql2ts/from-schema");

console.log(
  fromSchema.schemaToInterfaces(
    gqlSchema.default,
    {
      ignoreTypeNameDeclaration: true
    },
    {
      interfaceBuilder(name, body) {
        if (
          ![
            "IGraphQLResponseRoot",
            "IGraphQLResponseError",
            "IGraphQLResponseErrorLocation"
          ].includes(name)
        ) {
          return `export interface ${name} ${body.replace(
            /\| null/g,
            "| undefined"
          )} `;
        }
      }
    }
  )
);
