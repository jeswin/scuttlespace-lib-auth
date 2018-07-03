import pg = require("pg");
import * as psy from "psychopiggy";
import { ICallContext, ServiceResult, ValidResult } from "scuttlespace-api-common";
import * as errors from "./errors";

export default async function addPermissions(
  username: string,
  assigneeNetworkId: string,
  callerNetworkId: string,
  permissions: string[],
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<void>> {
  const accountQueryParams = new psy.Params({
    network_id: callerNetworkId,
    username
  });
  const { rows: accountRows } = await pool.query(
    `
    SELECT * FROM account 
    WHERE 
      username = ${accountQueryParams.id("username")} AND 
      network_id = ${accountQueryParams.id("network_id")}`,
    accountQueryParams.values()
  );

  return accountRows.length === 1
    ? await (async () => {
        const permissionsQueryParams = new psy.Params({
          network_id: assigneeNetworkId,
          username
        });
        const { rows: permissionsRows } = await pool.query(
          `
        SELECT * FROM account_permissions
        WHERE 
          username = ${permissionsQueryParams.id("username")} AND 
          network_id = ${permissionsQueryParams.id("network_id")}`,
          permissionsQueryParams.values()
        );

        const insertionParams = new psy.Params({
          network_id: assigneeNetworkId,
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
                  network_id: assigneeNetworkId,
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
                    network_id = ${updationParams.id("network_id")}
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
            message: `${callerNetworkId} cannot manage permissions for username ${username}.`
          },
          type: "error"
        }
      : errors.singleOrNone(accountRows);
}
