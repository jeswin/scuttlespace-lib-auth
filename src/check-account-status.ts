import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import * as errors from "./errors";

export interface IAccountStatusCheckResult {
  status: AccountStatus;
}

export enum AccountStatus {
  Available = "AVAILABLE",
  Taken = "TAKEN",
  Own = "OWN"
}

export default async function checkAccountStatus(
  username: string,
  callerExternalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IAccountStatusCheckResult>> {
  const params = new psy.Params({ username });
  const { rows } = await pool.query(
    `
    SELECT * FROM account
    WHERE 
      username = ${params.id("username")}`,
    params.values()
  );

  const result: IAccountStatusCheckResult =
    rows.length === 0
      ? { status: AccountStatus.Available }
      : rows.length > 1
        ? errors.singleOrNone(rows)
        : rows[0].external_username === callerExternalUsername
          ? { status: AccountStatus.Own }
          : { status: AccountStatus.Taken };

  return new ValidResult(result);
}
