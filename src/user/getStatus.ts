import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-service-common";
import * as errors from "../errors";
import { getPool } from "../pool";

export interface IUserStatusCheckResult {
  status: UserStatus;
}

export enum UserStatus {
  Available = "AVAILABLE",
  Taken = "TAKEN",
  Own = "OWN"
}

export async function getUsernameAvailability(
  username: string,
  externalId: string,
  context: ICallContext
): Promise<ServiceResult<IUserStatusCheckResult>> {
  const pool = getPool();
  const params = new psy.Params({ username });
  const { rows } = await pool.query(
    `
    SELECT * FROM scuttlespace_user
    WHERE 
      username = ${params.id("username")}`,
    params.values()
  );

  const result: IUserStatusCheckResult =
    rows.length === 0
      ? { status: UserStatus.Available }
      : rows.length > 1
        ? errors.singleOrNone(rows)
        : rows[0].external_id === externalId
          ? { status: UserStatus.Own }
          : { status: UserStatus.Taken };

  return new ValidResult(result);
}
