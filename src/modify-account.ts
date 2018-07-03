import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

async function accountExists(
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
) {
  const params = new psy.Params({ network_id: networkId });
  const { rows: existing } = await pool.query(
    `
    SELECT * FROM account 
    WHERE network_id=${params.id("network_id")}`,
    params.values()
  );

  return existing.length === 0;
}

function getMissingAccountError(networkId: string) {
  return new ErrorResult({
    code: "ACCOUNT_DOES_NOT_EXIST",
    message: `The user ${networkId} does not exist.`
  });
}

export async function editAbout(
  about: string,
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(networkId, pool, context)
    ? await (async () => {
        const params = new psy.Params({ about, network_id: networkId });
        await pool.query(
          `
          UPDATE account SET about=${params.id(
            "about"
          )} WHERE network_id=${params.id("network_id")}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(networkId);
}

export async function editDomain(
  domain: string,
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(networkId, pool, context)
    ? await (async () => {
        const params = new psy.Params({ domain, network_id: networkId });
        await pool.query(
          `
        UPDATE account SET domain=${params.id(
          "domain"
        )} WHERE network_id=${params.id("network_id")}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(networkId);
}

export async function editUsername(
  username: string,
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(networkId, pool, context)
    ? await (async () => {
        const params = new psy.Params({ username, network_id: networkId });
        await pool.query(
          `
            UPDATE account SET username=${params.id(
              "username"
            )} WHERE network_id=${params.id("network_id")}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(networkId);
}

export async function enable(
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(networkId, pool, context)
    ? await (async () => {
        const params = new psy.Params({ network_id: networkId });
        await pool.query(
          `UPDATE account SET enabled=true WHERE network_id=${params.id(
            "network_id"
          )}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(networkId);
}

export async function disable(
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(networkId, pool, context)
    ? await (async () => {
        const params = new psy.Params({ network_id: networkId });
        await pool.query(
          `UPDATE account SET enabled=false WHERE network_id=${params.id(
            "network_id"
          )}`,
          params.values()
        );
        return new ValidResult(undefined);
      })()
    : getMissingAccountError(networkId);
}

export async function destroy(
  networkId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<undefined>> {
  return accountExists(networkId, pool, context)
    ? await (async () => {
        const params = new psy.Params({ network_id: networkId });

        const { rows } = await pool.query(
          `SELECT * FROM account WHERE network_id=${params.id("network_id")}`,
          params.values()
        );

        return !rows[0].enabled
          ? await (async () => {
              await pool.query(
                `DELETE FROM account WHERE network_id=${params.id(
                  "network_id"
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
    : getMissingAccountError(networkId);
}
