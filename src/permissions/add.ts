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
import { getPool } from "../pool";
import { getUserByExternalId } from "../user";
import { getPermissionsForUser } from "./get";

export async function addPermissions(
  assigneeExternalId: string,
  assignerExternalId: string,
  permissions: IPermission[],
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const pool = getPool();
  const maybeUser = await parseServiceResult(
    getUserByExternalId(assignerExternalId, context)
  );

  return maybeUser
    ? await (async () => {
        const maybePermissions = await parseServiceResult(
          getPermissionsForUser(assigneeExternalId, assignerExternalId, context)
        );
        return !maybePermissions
          ? await (async () => {
              const insertionParams = new psy.Params({
                assignee_external_id: assigneeExternalId,
                assigner_external_id: assignerExternalId,
                permissions: permissions
                  .map(x => `${x.module}:${x.permission}`)
                  .filter(onlyUnique)
                  .sort()
                  .join(",")
              });

              await pool.query(
                `INSERT INTO user_permissions (${insertionParams.columns()})
                 VALUES (${insertionParams.ids()})`,
                insertionParams.values()
              );
              return new ValidResult({ username: maybeUser.username });
            })()
          : await (async () => {
              const updationParams = new psy.Params({
                assignee_external_id: assigneeExternalId,
                assigner_external_id: assignerExternalId,
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
                  UPDATE user_permissions SET permissions=${updationParams.id(
                    "permissions"
                  )}
                  WHERE 
                    assignee_external_id = ${updationParams.id(
                      "assignee_external_id"
                    )} AND 
                    assigner_external_id = ${updationParams.id("assigner_external_id")}
                `,
                updationParams.values()
              );
              return new ValidResult({ username: maybeUser.username });
            })();
      })()
    : new ErrorResult({
        code: "NO_ACCOUNT",
        message: `${assignerExternalId} does not have an user. Create an user first.`
      });
}

function onlyUnique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}
