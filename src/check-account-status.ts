import pg = require("pg");
import * as psy from "psychopiggy";
import { ServiceResult, ValidResult } from "scuttlespace-api-common";
import { IAPICallContext } from "standard-api";
import * as errors from "./errors";

export type AccountStatusCheckResult =
  | { status: "AVAILABLE" }
  | { status: "OWN" }
  | { status: "TAKEN" };

export default async function checkAccountStatus(
  username: string,
  callerNetworkId: string,
  pool: pg.Pool,
  context: IAPICallContext
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
        : rows[0].network_id === callerNetworkId
          ? { status: "OWN" }
          : { status: "TAKEN" };

  return new ValidResult(result);
}
