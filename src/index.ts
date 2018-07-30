import { IDbConfig } from "psychopiggy";
import { typeDefs, resolvers } from "./graphql-schema";
import * as pool from "./pool";

export * from "./permissions";
export { default as setup } from "./setup";
export * from "./user";

export async function init(dbConfig: IDbConfig) {
  return {
    pool: await pool.init(dbConfig)
  };
}

export const schema = {
  resolvers,
  typeDefs
};
