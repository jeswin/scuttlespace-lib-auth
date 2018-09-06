import { Pool } from "pg";
import { IDbConfig } from "psychopiggy";
import {
  IChangeUserStatusArgs,
  IChangeUserStatusResult,
  ICreateOrRenameUserArgs,
  ICreateOrRenameUserResult,
  IScuttlespaceUser
} from "scuttlespace-service-user-graphql-schema";

import * as pool from "./pool";
import resolvers from "./resolvers";

export * from "./permissions";
export { default as setup } from "./setup";
export * from "./user";

export async function init(dbConfig: IDbConfig) {
  const pgPpool: Pool = await pool.init(dbConfig);
  return {
    pool: pgPpool
  };
}

export const graphqlSchema = {
  resolvers
};
