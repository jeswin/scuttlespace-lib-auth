import { Pool } from "pg";
import { IDbConfig } from "psychopiggy";

let pool: Pool;
export async function init(config: IDbConfig) {
  pool = new Pool(config);
}

export function getPool() {
  return pool;
}
