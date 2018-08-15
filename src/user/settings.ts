import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-service-common";
import { getPool } from "../pool";
import { getMissingUserError, getUser } from "./common";

export async function editUserAbout(
  about: string,
  externalId: string,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const user = await getUser(externalId, context);
  return user
    ? await (async () => {
        const params = new psy.Params({
          about,
          external_id: externalId
        });
        await pool.query(
          `
          UPDATE scuttlespace_user SET about=${params.id(
            "about"
          )} WHERE external_id=${params.id("external_id")}`,
          params.values()
        );

        return new ValidResult({ username: user.username });
      })()
    : getMissingUserError(externalId);
}

export async function editUserDomain(
  domain: string,
  externalId: string,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const user = await getUser(externalId, context);
  return user
    ? await (async () => {
        const params = new psy.Params({
          domain,
          external_id: externalId
        });
        await pool.query(
          `
        UPDATE scuttlespace_user SET domain=${params.id(
          "domain"
        )} WHERE external_id=${params.id("external_id")}`,
          params.values()
        );
        return new ValidResult({ username: user.username });
      })()
    : getMissingUserError(externalId);
}
