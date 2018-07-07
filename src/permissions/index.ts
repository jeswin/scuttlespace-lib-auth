import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult,
} from "scuttlespace-api-common";
import * as errors from "../errors";

export interface IGetPermissionsResult {
  permissions: {
    assigneeExternalId: string;
    externalId: string;
    permissions: string;
  }[];
}

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
    SELECT * FROM account 
    WHERE 
      external_id = ${accountQueryParams.id("external_id")}`,
    accountQueryParams.values()
  );

  return new ValidResult({
    permissions: accountRows.map(r => ({
      assigneeExternalId: r.assignee_external_id,
      externalId: r.external_id,
      permissions: r.permissions
    }))
  });
}

export async function setPermissions(
  assigneeExternalId: string,
  externalId: string,
  permissions: string[],
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const accountQueryParams = new psy.Params({
    external_id: externalId
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE 
      external_id = ${accountQueryParams.id("external_id")}`,
    accountQueryParams.values()
  );

  const username = accountRows[0].username;

  return accountRows.length === 1
    ? await (async () => {
        const permissionsQueryParams = new psy.Params({
          assignee_external_id: assigneeExternalId,
          external_id: externalId
        });
        const { rows: permissionsRows } = await pool.query(
          `
        SELECT * FROM account_permissions
        WHERE 
          assignee_external_id = ${permissionsQueryParams.id(
            "assignee_external_id"
          )} AND 
          external_id = ${permissionsQueryParams.id(
            "external_id"
          )}`,
          permissionsQueryParams.values()
        );

        const insertionParams = new psy.Params({
          assignee_external_id: assigneeExternalId,
          external_id: externalId,
          permissions: permissions.join(",")
        });

        return permissionsRows.length === 0
          ? await (async () => {
              await pool.query(
                `INSERT INTO account_permissions (${insertionParams.columns()})
                 VALUES (${insertionParams.ids()})`,
                insertionParams.values()
              );
              return new ValidResult({ username });
            })()
          : permissionsRows.length === 1
            ? await (async () => {
                const updationParams = new psy.Params({
                  assignee_external_id: assigneeExternalId,
                  external_id: externalId,
                  permissions: permissions.join(",")
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
                    external_id = ${updationParams.id(
                      "external_id"
                    )}
                `,
                  updationParams.values()
                );
                return new ValidResult({ username });
              })()
            : errors.singleOrNone(permissionsRows);
      })()
    : accountRows.length === 0
      ? new ErrorResult({
          code: "NO_ACCOUNT",
          message: `${externalId} does not have an account. Create an account first.`
        })
      : errors.singleOrNone(accountRows);
}
