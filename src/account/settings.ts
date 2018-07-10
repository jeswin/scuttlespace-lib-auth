import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { getAccount, getMissingAccountError } from "../account/common";
import { getPool } from "../pool";

export async function editAccountAbout(
  about: string,
  externalId: string,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const account = await getAccount(externalId, context);
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
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const account = await getAccount(externalId, context);
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
