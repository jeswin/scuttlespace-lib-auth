import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ScuttleSpaceAPIData,
  ScuttleSpaceAPIError,
  ScuttleSpaceAPIResult
} from "scuttlespace-api-common";
import { IAPICallContext } from "standard-api";
import exception from "./exception";

async function ensureAccountExists(
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
) {
  const params = new psy.Params({ network_id: networkId });
  const { rows: existing } = await pool.query(
    `
    SELECT * FROM account 
    WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
  if (existing.length === 0) {
    exception(
      "USER_NOT_FOUND",
      `The user ${networkId} does not exist.`,
      context.id
    );
  }
}

export async function editAbout(
  about: string,
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIResult<undefined>> {
  await ensureAccountExists(networkId, pool, context);
  const params = new psy.Params({ about, network_id: networkId });
  await pool.query(
    `
        UPDATE account SET about=${params.id(
          "about"
        )} WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
  return new ScuttleSpaceAPIData(undefined);
}

export async function editDomain(
  domain: string,
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIResult<undefined>> {
  await ensureAccountExists(networkId, pool, context);
  const params = new psy.Params({ domain, network_id: networkId });
  await pool.query(
    `
    UPDATE account SET domain=${params.id(
      "domain"
    )} WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
  return new ScuttleSpaceAPIData(undefined);
}

export async function editUsername(
  username: string,
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIResult<undefined>> {
  await ensureAccountExists(networkId, pool, context);
  const params = new psy.Params({ username, network_id: networkId });
  await pool.query(
    `
        UPDATE account SET username=${params.id(
          "username"
        )} WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
  return new ScuttleSpaceAPIData(undefined);
}

export async function enable(
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIResult<undefined>> {
  await ensureAccountExists(networkId, pool, context);
  const params = new psy.Params({ network_id: networkId });
  await pool.query(
    `UPDATE account SET enabled=true WHERE network_id=${params.id(
      "network_id"
    )}`,
    params.values()
  );
  return new ScuttleSpaceAPIData(undefined);
}

export async function disable(
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIResult<undefined>> {
  await ensureAccountExists(networkId, pool, context);
  const params = new psy.Params({ network_id: networkId });
  await pool.query(
    `UPDATE account SET enabled=false WHERE network_id=${params.id(
      "network_id"
    )}`,
    params.values()
  );
  return new ScuttleSpaceAPIData(undefined);
}

export async function destroy(
  networkId: string,
  pool: pg.Pool,
  context: IAPICallContext
): Promise<ScuttleSpaceAPIResult<undefined>> {
  await ensureAccountExists(networkId, pool, context);
  const params = new psy.Params({ network_id: networkId });
  const { rows } = await pool.query(
    `SELECT * FROM account WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
  if (!rows[0].enabled) {
    await pool.query(
      `DELETE FROM account WHERE network_id=${params.id("network_id")}`,
      params.values()
    );
    return new ScuttleSpaceAPIData(undefined);
  } else {
    return new ScuttleSpaceAPIError({
      code: "CANNOT_DELETE_ACTIVE_ACCOUNT",
      message: `An account in active status cannot be deleted.`
    });
  }
}
