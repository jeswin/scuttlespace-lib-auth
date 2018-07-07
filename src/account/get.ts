import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

export interface IGetAccountByExternalUsernameResult {
  about: string;
  domain: string;
  enabled: boolean;
  externalUsername: string;
  username: string;
}

export async function getAccountByExternalUsername(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetAccountByExternalUsernameResult | undefined>> {
  const params = new psy.Params({ external_username: externalUsername });
  const { rows } = await pool.query(
    `SELECT * FROM account
     WHERE external_username = ${params.id("external_username")}`,
    params.values()
  );

  const result: IGetAccountByExternalUsernameResult | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          externalUsername,
          username: rows[0].username
        }
      : undefined;

  return new ValidResult(result);
}

export async function getAccountByUsername(
  username: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetAccountByExternalUsernameResult | undefined>> {
  const params = new psy.Params({ username });
  const { rows } = await pool.query(
    `SELECT * FROM account
     WHERE username = ${params.id("username")}`,
    params.values()
  );

  const result: IGetAccountByExternalUsernameResult | undefined =
    rows.length > 0
      ? {
          about: rows[0].about,
          domain: rows[0].domain,
          enabled: rows[0].enabled,
          externalUsername: rows[0].external_username,
          username
        }
      : undefined;

  return new ValidResult(result);
}
