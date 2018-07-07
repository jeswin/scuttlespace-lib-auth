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
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalUsername, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({
          about,
          external_username: externalUsername
        });
        await pool.query(
          `
          UPDATE account SET about=${params.id(
            "about"
          )} WHERE external_username=${params.id("external_username")}`,
          params.values()
        );

        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalUsername);
}

export async function editAccountDomain(
  domain: string,
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const account = await getAccount(externalUsername, pool, context);
  return account
    ? await (async () => {
        const params = new psy.Params({
          domain,
          external_username: externalUsername
        });
        await pool.query(
          `
        UPDATE account SET domain=${params.id(
          "domain"
        )} WHERE external_username=${params.id("external_username")}`,
          params.values()
        );
        return new ValidResult({ username: account.username });
      })()
    : getMissingAccountError(externalUsername);
}
