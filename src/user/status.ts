import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-service-common";
import { getPool } from "../pool";
import { getMissingUserError, getUser } from "./common";

import { IChangeUserStatusArgs } from "scuttlespace-service-user-graphql-schema";

export async function enableUser(
  { input: { externalId } }: { input: IChangeUserStatusArgs },
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const user = await getUser(externalId, context);
  return user
    ? await (async () => {
        const params = new psy.Params({ external_id: externalId });
        await pool.query(
          `UPDATE scuttlespace_user SET enabled=true WHERE external_id=${params.id(
            "external_id"
          )}`,
          params.values()
        );
        return new ValidResult({ username: user.username });
      })()
    : getMissingUserError(externalId);
}

export async function disableUser(
  { input: { externalId } }: { input: IChangeUserStatusArgs },
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const user = await getUser(externalId, context);
  return user
    ? await (async () => {
        const params = new psy.Params({ external_id: externalId });
        await pool.query(
          `UPDATE scuttlespace_user SET enabled=false WHERE external_id=${params.id(
            "external_id"
          )}`,
          params.values()
        );
        return new ValidResult({ username: user.username });
      })()
    : getMissingUserError(externalId);
}

export async function destroyUser(
  { input: { externalId } }: { input: IChangeUserStatusArgs },
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const user = await getUser(externalId, context);
  return user
    ? await (async () => {
        const params = new psy.Params({ external_id: externalId });

        const { rows } = await pool.query(
          `SELECT * FROM scuttlespace_user WHERE external_id=${params.id(
            "external_id"
          )}`,
          params.values()
        );

        return !rows[0].enabled
          ? await (async () => {
              await pool.query(
                `DELETE FROM scuttlespace_user WHERE external_id=${params.id(
                  "external_id"
                )}`,
                params.values()
              );
              return new ValidResult({ username: user.username });
            })()
          : new ErrorResult({
              code: "CANNOT_DELETE_ACTIVE_ACCOUNT",
              message: `An user in active status cannot be deleted.`
            });
      })()
    : getMissingUserError(externalId);
}
