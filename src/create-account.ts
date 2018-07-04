import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

export interface ICreateOrRenameArgs {
  externalUsername: string;
  username: string;
}

export enum CreateOrRenameResult {
  Created = "CREATED",
  Renamed = "RENAMED"
}

export default async function createOrRename(
  accountInfo: ICreateOrRenameArgs,
  pool: pg.Pool,
  context: ICallContext
): Promise<ServiceResult<CreateOrRenameResult>> {
  const existingCheckParams = new psy.Params({
    external_username: accountInfo.externalUsername
  });
  const { rows } = await pool.query(
    `SELECT * FROM account WHERE external_username=${existingCheckParams.id(
      "external_username"
    )}`,
    existingCheckParams.values()
  );

  return rows.length
    ? await (async () => {
        const params = new psy.Params({
          external_username: accountInfo.externalUsername,
          username: accountInfo.username
        });

        await pool.query(
          `UPDATE account SET username=${params.id(
            "username"
          )} WHERE external_username=${params.id("external_username")}
        `,
          params.values()
        );

        return new ValidResult(CreateOrRenameResult.Renamed);
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

        return new ValidResult(CreateOrRenameResult.Created);
      })();
}
