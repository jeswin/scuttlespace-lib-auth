import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

export interface ICreateOrRenameAccountArgs {
  externalUsername: string;
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
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<CreateOrRenameAccountResult>> {
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
              usernameRows[0].external_username === accountInfo.externalUsername
                ? CreateOrRenameAccountResult.Own
                : CreateOrRenameAccountResult.Taken
            )
          : await (async () => {
              const existingCheckParams = new psy.Params({
                external_username: accountInfo.externalUsername
              });
              const { rows: existingRows } = await pool.query(
                `SELECT * FROM account WHERE external_username=${existingCheckParams.id(
                  "external_username"
                )}`,
                existingCheckParams.values()
              );

              return existingRows.length
                ? await (async () => {
                    const params = new psy.Params({
                      external_username: accountInfo.externalUsername,
                      username: accountInfo.username
                    });

                    await pool.query(
                      `UPDATE account SET username=${params.id(
                        "username"
                      )} WHERE external_username=${params.id(
                        "external_username"
                      )}
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
                      external_username: accountInfo.externalUsername,
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
