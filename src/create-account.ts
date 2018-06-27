import pg = require("pg");
import * as psy from "psychopiggy";

export interface ICreateAccountArgs {
  about: string;
  domain: string;
  enabled: boolean;
  network_id: string;
  username: string;
}

export default async function createAccount(
  accountInfo: ICreateAccountArgs,
  pool: pg.Pool
): Promise<void> {
  const params = new psy.Params(accountInfo);
  await pool.query(
    `
    INSERT INTO account (${params.columns()})
    VALUES(${params.ids()})`,
    params.values()
  );
}
