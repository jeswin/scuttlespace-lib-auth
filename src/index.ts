import { IDbConfig } from "psychopiggy";
import * as pool from "./pool";

export { default as setup } from "./setup";
export * from "./account";
export * from "./permissions";

export async function init(dbConfig: IDbConfig) {
  await pool.init(dbConfig);
}
