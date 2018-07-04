import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

async function accountExists(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
) {
  const params = new psy.Params({ external_username: externalUsername });
  const { rows: existing } = await pool.query(
    `
    SELECT * FROM account 
    WHERE external_username=${params.id("external_username")}`,
    params.values()
  );

  return existing.length === 0;
}

function getMissingAccountError(externalUsername: string) {
  return new ErrorResult({
    code: "ACCOUNT_DOES_NOT_EXIST",
    message: `The user ${externalUsername} does not exist.`
  });
}

export async function editAbout(
  about: string,
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(externalUsername, pool, context)
    ? await (async () => {
        const params = new psy.Params({ about, external_username: externalUsername });
        await pool.query(
          `
          UPDATE account SET about=${params.id(
            "about"
          )} WHERE external_username=${params.id("external_username")}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(externalUsername);
}

export async function editDomain(
  domain: string,
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(externalUsername, pool, context)
    ? await (async () => {
        const params = new psy.Params({ domain, external_username: externalUsername });
        await pool.query(
          `
        UPDATE account SET domain=${params.id(
          "domain"
        )} WHERE external_username=${params.id("external_username")}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(externalUsername);
}

export async function editUsername(
  username: string,
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(externalUsername, pool, context)
    ? await (async () => {
        const params = new psy.Params({ username, external_username: externalUsername });
        await pool.query(
          `
            UPDATE account SET username=${params.id(
              "username"
            )} WHERE external_username=${params.id("external_username")}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(externalUsername);
}

export async function enable(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(externalUsername, pool, context)
    ? await (async () => {
        const params = new psy.Params({ external_username: externalUsername });
        await pool.query(
          `UPDATE account SET enabled=true WHERE external_username=${params.id(
            "external_username"
          )}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(externalUsername);
}

export async function disable(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(externalUsername, pool, context)
    ? await (async () => {
        const params = new psy.Params({ external_username: externalUsername });
        await pool.query(
          `UPDATE account SET enabled=false WHERE external_username=${params.id(
            "external_username"
          )}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(externalUsername);
}

export async function destroy(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(externalUsername, pool, context)
    ? await (async () => {
        const params = new psy.Params({ external_username: externalUsername });

        const { rows } = await pool.query(
          `SELECT * FROM account WHERE external_username=${params.id("external_username")}`,
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
              return new ValidResult(undefined);
            })()
          : new ErrorResult({
              code: "CANNOT_DELETE_ACTIVE_ACCOUNT",
              message: `An account in active status cannot be deleted.`
            });
      })()
    : getMissingAccountError(externalUsername);
}
