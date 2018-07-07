import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { getAccount, getMissingAccountError } from "../account/common";

export async function enableAccount(
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalId, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({ external_id: externalId });
        await pool.query(
          `UPDATE account SET enabled=true WHERE external_id=${params.id(
            "external_id"
          )}`,
          params.values()
        );
        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalId);
}

export async function disableAccount(
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalId, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({ external_id: externalId });
        await pool.query(
          `UPDATE account SET enabled=false WHERE external_id=${params.id(
            "external_id"
          )}`,
          params.values()
        );
        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalId);
}

export async function destroyAccount(
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalId, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({ external_id: externalId });

        const { rows } = await pool.query(
          `SELECT * FROM account WHERE external_id=${params.id(
            "external_id"
          )}`,
          params.values()
        );

        return !rows[0].enabled
          ? await (async () => {
              await pool.query(
                `DELETE FROM account WHERE external_id=${params.id(
                  "external_id"
                )}`,
                params.values()
              );
              return new ValidResult({ username: account.username });
            })()
          : new ErrorResult({
              code: "CANNOT_DELETE_ACTIVE_ACCOUNT",
              message: `An account in active status cannot be deleted.`
            });
      })()
    : getMissingAccountError(externalId);
}
