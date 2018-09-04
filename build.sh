rm -rf dist
ts-node tools/generateResolvers.ts > src/resolvers.ts
prettier --write src/resolvers.ts
tsc