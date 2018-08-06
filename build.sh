rm -rf dist
tsc
node tools/graphql-to-ts.js > src/gql-schema-types.ts
prettier --write src/gql-schema-types.ts