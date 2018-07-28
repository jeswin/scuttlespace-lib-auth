import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { IPermission } from ".";
import { getPool } from "../pool";

export type IGetPermissionsResult = {
  assigneeExternalId: string;
  assignerExternalId: string;
  permissions: IPermission[];
}[];

export async function getPermissions(
  assignerExternalId: string,
  context: ICallContext
): Promise<ServiceResult<IGetPermissionsResult>> {
  const pool = getPool();
  const userQueryParams = new psy.Params({
    assigner_external_id: assignerExternalId
  });
  const { rows: userRows } = await pool.query(
    `
    SELECT * FROM user_permissions
    WHERE assigner_external_id = ${userQueryParams.id("assigner_external_id")}`,
    userQueryParams.values()
  );

  return new ValidResult(
    userRows.map(r => ({
      assigneeExternalId: r.assignee_external_id,
      assignerExternalId: r.assigner_external_id,
      permissions: r.permissions
        ? (r.permissions as string).split(",").map(x => {
            const [module, permission] = x.split(":");
            return { module, permission };
          })
        : []
    }))
  );
}

export interface IGetPermissionsForUserResult {
  assigneeExternalId: string;
  assignerExternalId: string;
  permissions: IPermission[];
}

export async function getPermissionsForUser(
  assigneeExternalId: string,
  assignerExternalId: string,
  context: ICallContext
): Promise<ServiceResult<IGetPermissionsForUserResult | undefined>> {
  const pool = getPool();
  const userQueryParams = new psy.Params({
    assignee_external_id: assigneeExternalId,
    assigner_external_id: assignerExternalId
  });
  const { rows: userRows } = await pool.query(
    `
    SELECT * FROM user_permissions
    WHERE 
      assignee_external_id = ${userQueryParams.id("assignee_external_id")} AND
      assigner_external_id = ${userQueryParams.id("assigner_external_id")}`,
    userQueryParams.values()
  );

  return new ValidResult(
    userRows.length > 0
      ? {
          assigneeExternalId: userRows[0].assignee_external_id,
          assignerExternalId: userRows[0].assigner_external_id,
          permissions: userRows[0].permissions
            ? (userRows[0].permissions as string).split(",").map(x => {
                const [module, permission] = x.split(":");
                return { module, permission };
              })
            : []
        }
      : undefined
  );
}
