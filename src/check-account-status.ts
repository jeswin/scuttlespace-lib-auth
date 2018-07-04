import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext, ServiceResult, ValidResult } from "scuttlespace-api-common";
import * as errors from "./errors";

export type AccountStatusCheckResult =
  | { status: "AVAILABLE" }
  | { status: "OWN" }
  | { status: "TAKEN" };

export default async function checkAccountStatus(
  username: string,
  callerExternalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<AccountStatusCheckResult>> {
  const params = new psy.Params({ username });
  const { rows } = await pool.query(
    `
    SELECT * FROM account
    WHERE 
      username = ${params.id("username")}`,
    params.values()
  );

  const result: AccountStatusCheckResult =
    rows.length === 0
      ? { status: "AVAILABLE" }
      : rows.length > 1
        ? errors.singleOrNone(rows)
        : rows[0].external_username === callerExternalUsername
          ? { status: "OWN" }
          : { status: "TAKEN" };

  return new ValidResult(result);
}
