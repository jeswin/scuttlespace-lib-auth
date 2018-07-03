import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

export interface IGetAccountByNetworkIdResult {
  about: string;
  domain: string;
  enabled: boolean;
  networkId: string;
  username: string;
}

export async function getAccountByNetworkId(
  callerNetworkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetAccountByNetworkIdResult | undefined>> {
  const params = new psy.Params({ network_id: callerNetworkId });
  const { rows } = await pool.query(
    `SELECT * FROM account
     WHERE network_id = ${params.id("network_id")}`,
    params.values()
  );

  const result: IGetAccountByNetworkIdResult | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          networkId: callerNetworkId,
          username: rows[0].username
        }
      : undefined;

  return new ValidResult(result);
}

export async function getAccountByUsername(
  username: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetAccountByNetworkIdResult | undefined>> {
  const params = new psy.Params({ username });
  const { rows } = await pool.query(
    `SELECT * FROM account
     WHERE username = ${params.id("username")}`,
    params.values()
  );

  const result: IGetAccountByNetworkIdResult | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          networkId: rows[0].network_id,
          username
        }
      : undefined;

  return new ValidResult(result);
}
