rm -rf dist
tsc src/graphql/schema.ts --outDir dist/graphql
node tools/graphql-to-ts.js > src/graphql/schema-types.ts
tsc
prettier --write src/graphql/schema-types.ts