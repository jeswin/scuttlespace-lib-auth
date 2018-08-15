import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext } from "scuttlespace-service-common";
import { ErrorResult } from "scuttlespace-service-common";
import { getPool } from "../pool";

export function getMissingUserError(externalId: string) {
  return new ErrorResult({
    code: "ACCOUNT_DOES_NOT_EXIST",
    message: `The user ${externalId} does not exist.`
  });
}

export async function getUser(externalId: string, context: ICallContext) {
  const pool = getPool();
  const params = new psy.Params({ external_id: externalId });
  const { rows } = await pool.query(
    `
    SELECT * FROM scuttlespace_user 
    WHERE external_id=${params.id("external_id")}`,
    params.values()
  );

  return rows[0];
}
