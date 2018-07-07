import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext } from "scuttlespace-api-common";
import { ErrorResult } from "scuttlespace-api-common";

export function getMissingAccountError(externalUsername: string) {
  return new ErrorResult({
    code: "ACCOUNT_DOES_NOT_EXIST",
    message: `The user ${externalUsername} does not exist.`
  });
}

export async function getAccount(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
) {
  const params = new psy.Params({ external_username: externalUsername });
  const { rows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE external_username=${params.id("external_username")}`,
    params.values()
  );

  return rows[0];
}
