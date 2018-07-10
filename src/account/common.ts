import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext } from "scuttlespace-api-common";
import { ErrorResult } from "scuttlespace-api-common";
import { getPool } from "../pool";

export function getMissingAccountError(externalId: string) {
  return new ErrorResult({
    code: "ACCOUNT_DOES_NOT_EXIST",
    message: `The user ${externalId} does not exist.`
  });
}

export async function getAccount(externalId: string, context: ICallContext) {
  const pool = getPool();
  const params = new psy.Params({ external_id: externalId });
  const { rows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE external_id=${params.id("external_id")}`,
    params.values()
  );

  return rows[0];
}
