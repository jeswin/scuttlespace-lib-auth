import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { getAccount, getMissingAccountError } from "../account/common";

export async function editAccountAbout(
  about: string,
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalId, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({
          about,
          external_id: externalId
        });
        await pool.query(
          `
          UPDATE account SET about=${params.id(
            "about"
          )} WHERE external_id=${params.id("external_id")}`,
          params.values()
        );

        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalId);
}

export async function editAccountDomain(
  domain: string,
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalId, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({
          domain,
          external_id: externalId
        });
        await pool.query(
          `
        UPDATE account SET domain=${params.id(
          "domain"
        )} WHERE external_id=${params.id("external_id")}`,
          params.values()
        );
        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalId);
}
