import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ScuttleSpaceAPIData,
  ScuttleSpaceAPIResult
} from "scuttlespace-api-common";
import { IAPICallContext } from "standard-api";
import * as errors from "./errors";

export interface IGetAccountForCallerResult {
  networkId: string;
  username: string;
}

export default async function getAccountForCaller(
  callerNetworkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIData<IGetAccountForCallerResult | undefined>> {
  const params = new psy.Params({ network_id: callerNetworkId });
  const { rows } = await pool.query(
    `SELECT * FROM account
     WHERE network_id = ${params.id("network_id")}`,
    params.values()
  );

  const result: IGetAccountForCallerResult | undefined =
    rows.length > 0
      ? {
          networkId: callerNetworkId,
          username: rows[0].username
        }
      : undefined;

  return new ScuttleSpaceAPIData(result);
}
