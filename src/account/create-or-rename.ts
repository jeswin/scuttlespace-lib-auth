import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { getPool } from "../pool";

export interface ICreateOrRenameAccountArgs {
  externalId: string;
  username: string;
}

export enum CreateOrRenameAccountResult {
  Created = "CREATED",
  Own = "OWN",
  Renamed = "RENAMED",
  Taken = "TAKEN"
}

export async function createOrRenameAccount(
  accountInfo: ICreateOrRenameAccountArgs,
  context: ICallContext
): Promise<ServiceResult<CreateOrRenameAccountResult>> {
  const pool = getPool();
  return isValidUsername(accountInfo.username)
    ? await (async () => {
        const usernameCheckParams = new psy.Params({
          username: accountInfo.username
        });

        const { rows: usernameRows } = await pool.query(
          `SELECT * FROM account WHERE username=${usernameCheckParams.id(
            "username"
          )}`,
          usernameCheckParams.values()
        );

        return usernameRows.length
          ? new ValidResult(
              usernameRows[0].external_id === accountInfo.externalId
                ? CreateOrRenameAccountResult.Own
                : CreateOrRenameAccountResult.Taken
            )
          : await (async () => {
              const existingCheckParams = new psy.Params({
                external_id: accountInfo.externalId
              });
              const { rows: existingRows } = await pool.query(
                `SELECT * FROM account WHERE external_id=${existingCheckParams.id(
                  "external_id"
                )}`,
                existingCheckParams.values()
              );

              return existingRows.length
                ? await (async () => {
                    const params = new psy.Params({
                      external_id: accountInfo.externalId,
                      username: accountInfo.username
                    });

                    await pool.query(
                      `UPDATE account SET username=${params.id(
                        "username"
                      )} WHERE external_id=${params.id("external_id")}
                  `,
                      params.values()
                    );

                    return new ValidResult(CreateOrRenameAccountResult.Renamed);
                  })()
                : await (async () => {
                    const params = new psy.Params({
                      about: "",
                      domain: "",
                      enabled: true,
                      external_id: accountInfo.externalId,
                      username: accountInfo.username
                    });

                    await pool.query(
                      `
                  INSERT INTO account(${params.columns()})
                  VALUES(${params.ids()})`,
                      params.values()
                    );

                    return new ValidResult(CreateOrRenameAccountResult.Created);
                  })();
            })();
      })()
    : new ErrorResult({
        code: "INVALID_USERNAME",
        message: "Invalid characters in username"
      });
}

export function isValidUsername(username: string) {
  const regex = /^[a-z][a-z0-9_]+$/;
  return regex.test(username);
}
