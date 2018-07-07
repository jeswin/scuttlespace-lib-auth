import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { IPermission } from ".";

export type IGetPermissionsResult = {
  assigneeExternalId: string;
  externalId: string;
  permissions: IPermission[];
}[];

export async function getPermissions(
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetPermissionsResult>> {
  const accountQueryParams = new psy.Params({
    external_id: externalId
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account_permissions
    WHERE 
      external_id = ${accountQueryParams.id("external_id")}`,
    accountQueryParams.values()
  );

  return new ValidResult(
    accountRows.map(r => ({
      assigneeExternalId: r.assignee_external_id,
      externalId: r.external_id,
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
  externalId: string;
  permissions: IPermission[];
}

export async function getPermissionsForUser(
  assigneeExternalId: string,
  externalId: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetPermissionsForUserResult | undefined>> {
  const accountQueryParams = new psy.Params({
    assignee_external_id: assigneeExternalId,
    external_id: externalId
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account_permissions
    WHERE 
      assignee_external_id = ${accountQueryParams.id(
        "assignee_external_id"
      )} AND
      external_id = ${accountQueryParams.id("external_id")}`,
    accountQueryParams.values()
  );

  return new ValidResult(
    accountRows.length > 0
      ? {
          assigneeExternalId: accountRows[0].assignee_external_id,
          externalId: accountRows[0].external_id,
          permissions: accountRows[0].permissions
            ? (accountRows[0].permissions as string).split(",").map(x => {
                const [module, permission] = x.split(":");
                return { module, permission };
              })
            : []
        }
      : undefined
  );
}
