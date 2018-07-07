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
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalUsername, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({ external_username: externalUsername });
        await pool.query(
          `UPDATE account SET enabled=true WHERE external_username=${params.id(
            "external_username"
          )}`,
          params.values()
        );
        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalUsername);
}

export async function disableAccount(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalUsername, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({ external_username: externalUsername });
        await pool.query(
          `UPDATE account SET enabled=false WHERE external_username=${params.id(
            "external_username"
          )}`,
          params.values()
        );
        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalUsername);
}

export async function destroyAccount(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalUsername, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({ external_username: externalUsername });

        const { rows } = await pool.query(
          `SELECT * FROM account WHERE external_username=${params.id(
            "external_username"
          )}`,
          params.values()
        );

        return !rows[0].enabled
          ? await (async () => {
              await pool.query(
                `DELETE FROM account WHERE external_username=${params.id(
                  "external_username"
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
    : getMissingAccountError(externalUsername);
}
