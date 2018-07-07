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
    assigneeExternalUsername: string;
    externalUsername: string;
    permissions: string;
  }[];
}

export async function getPermissions(
  externalUsername: string,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<IGetPermissionsResult>> {
  const accountQueryParams = new psy.Params({
    external_username: externalUsername
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE 
      external_username = ${accountQueryParams.id("external_username")}`,
    accountQueryParams.values()
  );

  return new ValidResult({
    permissions: accountRows.map(r => ({
      assigneeExternalUsername: r.assignee_external_username,
      externalUsername: r.external_username,
      permissions: r.permissions
    }))
  });
}

export async function setPermissions(
  assigneeExternalUsername: string,
  externalUsername: string,
  permissions: string[],
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<{ username: string }>> {
  const accountQueryParams = new psy.Params({
    external_username: externalUsername
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE 
      external_username = ${accountQueryParams.id("external_username")}`,
    accountQueryParams.values()
  );

  const username = accountRows[0].username;

  return accountRows.length === 1
    ? await (async () => {
        const permissionsQueryParams = new psy.Params({
          assignee_external_username: assigneeExternalUsername,
          external_username: externalUsername
        });
        const { rows: permissionsRows } = await pool.query(
          `
        SELECT * FROM account_permissions
        WHERE 
          assignee_external_username = ${permissionsQueryParams.id(
            "assignee_external_username"
          )} AND 
          external_username = ${permissionsQueryParams.id(
            "external_username"
          )}`,
          permissionsQueryParams.values()
        );

        const insertionParams = new psy.Params({
          assignee_external_username: assigneeExternalUsername,
          external_username: externalUsername,
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
                  assignee_external_username: assigneeExternalUsername,
                  external_username: externalUsername,
                  permissions: permissions.join(",")
                });
                await pool.query(
                  `
                  UPDATE account_permissions SET permissions=${updationParams.id(
                    "permissions"
                  )}
                  WHERE 
                    assignee_external_username = ${updationParams.id(
                      "assignee_external_username"
                    )} AND 
                    external_username = ${updationParams.id(
                      "external_username"
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
          message: `${externalUsername} does not have an account. Create an account first.`
        })
      : errors.singleOrNone(accountRows);
}
