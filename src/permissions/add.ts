import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  parseServiceResult,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { IPermission } from ".";
import { getAccountByExternalId } from "../account";
import { getPool } from "../pool";
import { getPermissionsForUser } from "./get";

export async function addPermissions(
  assigneeExternalId: string,
  externalId: string,
  permissions: IPermission[],
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const maybeAccount = await parseServiceResult(
    getAccountByExternalId(externalId, context)
  );

  return maybeAccount
    ? await (async () => {
        const maybePermissions = await parseServiceResult(
          getPermissionsForUser(assigneeExternalId, externalId, context)
        );
        return !maybePermissions
          ? await (async () => {
              const insertionParams = new psy.Params({
                assignee_external_id: assigneeExternalId,
                external_id: externalId,
                permissions: permissions
                  .map(x => `${x.module}:${x.permission}`)
                  .filter(onlyUnique)
                  .sort()
                  .join(",")
              });

              await pool.query(
                `INSERT INTO account_permissions (${insertionParams.columns()})
                 VALUES (${insertionParams.ids()})`,
                insertionParams.values()
              );
              return new ValidResult({ username: maybeAccount.username });
            })()
          : await (async () => {
              const updationParams = new psy.Params({
                assignee_external_id: assigneeExternalId,
                external_id: externalId,
                permissions: (typeof maybePermissions !== "undefined"
                  ? maybePermissions.permissions.concat(permissions)
                  : []
                )
                  .map(x => `${x.module}:${x.permission}`)
                  .filter(onlyUnique)
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

function onlyUnique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}
