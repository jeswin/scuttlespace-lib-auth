import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext } from "./types";

export interface ICreateAccountArgs {
  about: string;
  domain: string;
  enabled: boolean;
  networkId: string;
  username: string;
}

export default async function createAccount(
  accountInfo: ICreateAccountArgs,
  pool: pg.Pool,
  context: ICallContext
): Promise<void> {
  const params = new psy.Params({
    about: accountInfo.about,
    domain: accountInfo.domain,
    enabled: accountInfo.enabled,
    network_id: accountInfo.networkId,
    username: accountInfo.username
  });
  await pool.query(
    `
    INSERT INTO account (${params.columns()})
    VALUES(${params.ids()})`,
    params.values()
  );
}
