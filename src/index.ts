import { IDbConfig } from "psychopiggy";
import * as pool from "./pool";
export { default as graphqlSchema } from "./graphql-schema";

export * from "./permissions";
export { default as setup } from "./setup";
export * from "./user";

export async function init(dbConfig: IDbConfig) {
  return {
    pool: await pool.init(dbConfig)
  };
}
