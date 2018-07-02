import pg = require("pg");
import * as psy from "psychopiggy";
import * as errors from "./errors";
import { ICallContext } from "./types";

export interface IGetAccountForCallerResult {
  networkId: string;
  username: string;
}

export default async function getAccountForCaller(
  callerNetworkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<IGetAccountForCallerResult | void> {
  const params = new psy.Params({ network_id: callerNetworkId });
  const { rows } = await pool.query(
    `SELECT * FROM account
     WHERE network_id = ${params.id("network_id")}`,
    params.values()
  );

  return rows.length > 0
    ? {
        networkId: callerNetworkId,
        username: rows[0].username
      }
    : undefined;
}
