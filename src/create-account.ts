import pg = require("pg");
import * as psy from "psychopiggy";
import {
  ICallContext,
  ServiceResult,
  ValidResult
} from "scuttlespace-api-common";

export interface ICreateOrRenameArgs {
  networkId: string;
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
    network_id: accountInfo.networkId
  });
  const { rows } = await pool.query(
    `SELECT * FROM account WHERE network_id=${existingCheckParams.id(
      "network_id"
    )}`,
    existingCheckParams.values()
  );

  return rows.length
    ? await (async () => {
        const params = new psy.Params({
          network_id: accountInfo.networkId,
          username: accountInfo.username
        });

        await pool.query(
          `UPDATE account SET username=${params.id(
            "username"
          )} WHERE network_id=${params.id("network_id")}
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
          network_id: accountInfo.networkId,
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
