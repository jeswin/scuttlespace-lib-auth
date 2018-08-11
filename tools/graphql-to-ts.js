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
          const newBody = body
            .split("\n")
            .map(
              x =>
                x.includes("| null")
                  ? x.replace(":", "?:").replace(/\| null/g, "")
                  : x
            )
            .join("\n");
          return `export interface ${name} ${newBody} `;
        }
      }
    }
  )
);
