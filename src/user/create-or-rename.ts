import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ErrorResult,
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";
import { getPool } from "../pool";

export interface ICreateOrRenameUserArgs {
  externalId: string;
  pub: string;
  username: string;
}

export enum CreateOrRenameUserResult {
  Created = "CREATED",
  Own = "OWN",
  Renamed = "RENAMED",
  Taken = "TAKEN"
}

export async function createOrRenameUser(
  userInfo: ICreateOrRenameUserArgs,
  context: ICallContext
): Promise<ServiceResult<CreateOrRenameUserResult>> {
  const pool = getPool();
  return isValidUsername(userInfo.username)
    ? await (async () => {
        const usernameCheckParams = new psy.Params({
          username: userInfo.username
        });

        const { rows: usernameRows } = await pool.query(
          `SELECT * FROM scuttlespace_user WHERE username=${usernameCheckParams.id(
            "username"
          )}`,
          usernameCheckParams.values()
        );

        return usernameRows.length
          ? new ValidResult(
              usernameRows[0].external_id === userInfo.externalId
                ? CreateOrRenameUserResult.Own
                : CreateOrRenameUserResult.Taken
            )
          : await (async () => {
              const existingCheckParams = new psy.Params({
                external_id: userInfo.externalId
              });
              const { rows: existingRows } = await pool.query(
                `SELECT * FROM scuttlespace_user WHERE external_id=${existingCheckParams.id(
                  "external_id"
                )}`,
                existingCheckParams.values()
              );

              return existingRows.length
                ? await (async () => {
                    const params = new psy.Params({
                      external_id: userInfo.externalId,
                      username: userInfo.username
                    });

                    await pool.query(
                      `UPDATE scuttlespace_user SET username=${params.id(
                        "username"
                      )} WHERE external_id=${params.id("external_id")}
                  `,
                      params.values()
                    );

                    return new ValidResult(CreateOrRenameUserResult.Renamed);
                  })()
                : await (async () => {
                    const params = new psy.Params({
                      about: "",
                      domain: "",
                      enabled: true,
                      external_id: userInfo.externalId,
                      pub: userInfo.pub,
                      username: userInfo.username
                    });

                    await pool.query(
                      `
                  INSERT INTO scuttlespace_user(${params.columns()})
                  VALUES(${params.ids()})`,
                      params.values()
                    );

                    return new ValidResult(CreateOrRenameUserResult.Created);
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
