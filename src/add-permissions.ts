import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext, ServiceResult, ValidResult } from "scuttlespace-api-common";
import * as errors from "./errors";

export default async function addPermissions(
  username: string,
  assigneeExternalUsername: string,
  externalUsername: string,
  permissions: string[],
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<void>> {
  const accountQueryParams = new psy.Params({
    external_username: externalUsername,
    username
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE 
      username = ${accountQueryParams.id("username")} AND 
      external_username = ${accountQueryParams.id("external_username")}`,
    accountQueryParams.values()
  );

  return accountRows.length === 1
    ? await (async () => {
        const permissionsQueryParams = new psy.Params({
          external_username: assigneeExternalUsername,
          username
        });
        const { rows: permissionsRows } = await pool.query(
          `
        SELECT * FROM account_permissions
        WHERE 
          username = ${permissionsQueryParams.id("username")} AND 
          external_username = ${permissionsQueryParams.id("external_username")}`,
          permissionsQueryParams.values()
        );

        const insertionParams = new psy.Params({
          external_username: assigneeExternalUsername,
          permissions: permissions.join(","),
          username
        });

        return permissionsRows.length === 0
          ? await (async () => {
              await pool.query(
                `
            INSERT INTO account_permissions (${insertionParams.columns()})
            VALUES (${insertionParams.ids()})
          `,
                insertionParams.values()
              );
              return new ValidResult(undefined);
            })()
          : permissionsRows.length === 1
            ? await (async () => {
                const updationParams = new psy.Params({
                  external_username: assigneeExternalUsername,
                  permissions: permissions.join(","),
                  username
                });
                await pool.query(
                  `
                  UPDATE account_permissions SET permissions=${updationParams.id(
                    "permissions"
                  )}
                  WHERE 
                    username = ${updationParams.id("username")} AND 
                    external_username = ${updationParams.id("external_username")}
                `,
                  updationParams.values()
                );
                return new ValidResult(undefined);
              })()
            : errors.singleOrNone(permissionsRows);
      })()
    : accountRows.length === 0
      ? {
          error: {
            code: "NO_MANAGE_PERMISSION",
            message: `${externalUsername} cannot manage permissions for username ${username}.`
          },
          type: "error"
        }
      : errors.singleOrNone(accountRows);
}
