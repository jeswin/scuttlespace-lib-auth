import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  parseServiceResult,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { getAccountByExternalId } from "../account";
import * as errors from "../errors";
import { getPermissionsForUser } from "./get";

export async function clearPermissions(
  module: string,
  assigneeExternalId: string,
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const maybeAccount = await parseServiceResult(
    getAccountByExternalId(externalId, pool, context)
  );

  return maybeAccount
    ? await (async () => {
        const maybePermissions = await parseServiceResult(
          getPermissionsForUser(assigneeExternalId, externalId, pool, context)
        );
        return !maybePermissions
          ? new ValidResult({ username: maybeAccount.username })
          : await (async () => {
              const updationParams = new psy.Params({
                assignee_external_id: assigneeExternalId,
                external_id: externalId,
                permissions: (typeof maybePermissions !== "undefined"
                  ? maybePermissions.permissions
                  : []
                )
                  .filter(x => x.module !== module)
                  .map(x => `${x.module}:${x.permission}`)
                  .sort()
                  .join(",")
              });

              await pool.query(
                `
                  UPDATE account_permissions SET permissions=${updationParams.id(
                    "permissions"
                  )}
                  WHERE 
                    assignee_external_id = ${updationParams.id(
                      "assignee_external_id"
                    )} AND 
                    external_id = ${updationParams.id("external_id")}
                `,
                updationParams.values()
              );
              return new ValidResult({ username: maybeAccount.username });
            })();
      })()
    : new ErrorResult({
        code: "NO_ACCOUNT",
        message: `${externalId} does not have an account. Create an account first.`
      });
}
