import "mocha";
import pg = require("pg");
import * as psy from "psychopiggy";
import "should";
import setup from "../setup";
import activationTests from "./account/activation-tests";
import accountCreationAndRenameTests from "./account/creation-and-rename-tests";
import accountDetailsTests from "./account/details-tests";
import accountSettingsTests from "./account/settings-tests";
import statusCheckTests from "./account/status-check-tests";
import managePermissionsTests from "./permissions/manage-tests";

/* tslint:disable */
if (
  !process.env.NODE_ENV ||
  process.env.NODE_ENV.toLowerCase() !== "development"
) {
  console.log("Tests can only be run in the development environment.");
  process.exit(1);
}

if (
  !process.env.SCUTTLESPACE_TESTDB_NAME ||
  !process.env.SCUTTLESPACE_TESTDB_NAME.includes("test")
) {
  console.log(
    `Refusing to run with database '${
      process.env.SCUTTLESPACE_TESTDB_NAME
    }'. Db should include the word 'test'.`
  );
  process.exit(1);
}
/* tslint:enable */

export interface IDbConfig {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
}

export function getCallContext() {
  return { id: "TEST_RUN" };
}

async function recreateDb(config: IDbConfig) {
  const pool = new pg.Pool({ ...config, database: "template1" });

  const {
    rows: existingDbRows
  } = await pool.query(`SELECT 1 AS result FROM pg_database
    WHERE datname='${config.database}'`);

  if (existingDbRows.length) {
    await pool.query(`DROP DATABASE ${config.database}`);
  }

  await pool.query(`CREATE DATABASE ${config.database} OWNER ${config.user}`);
}

export function getEnvValue(envVar: string): string | never {
  const val = process.env[envVar];
  if (typeof val === "undefined") {
    throw new Error(`Expected ${envVar} to be defined.`);
  }
  return val;
}

export function getDbConfig(): psy.IDbConfig {
  return {
    database: getEnvValue("SCUTTLESPACE_TESTDB_NAME"),
    host: getEnvValue("SCUTTLESPACE_TESTDB_HOST"),
    password: getEnvValue("SCUTTLESPACE_TESTDB_PASSWORD"),
    port: parseInt(getEnvValue("SCUTTLESPACE_TESTDB_PORT"), 10),
    user: getEnvValue("SCUTTLESPACE_TESTDB_USER")
  };
}

export const dbConfig = getDbConfig();

export const user1 = {
  about: "hal9000 supervisor",
  domain: "jeswin.org",
  enabled: true,
  external_username: "jpk001",
  username: "jeswin"
};

export const user2 = {
  about: "bazinga!",
  domain: "example.com",
  enabled: true,
  external_username: "gp001",
  username: "geospeed"
};

export async function insertUser(user: any, pool: pg.Pool) {
  const params = new psy.Params(user);
  await pool.query(
    `INSERT INTO account (${params.columns()}) VALUES(${params.ids()})`,
    params.values()
  );
}

export const permissions1 = {
  assignee_external_username: "gp001",
  external_username: "jpk001",
  permissions: "write"
};

export async function insertPermissions(permissions: any, pool: pg.Pool) {
  const params = new psy.Params(permissions);
  await pool.query(
    `INSERT INTO account_permissions (${params.columns()}) VALUES(${params.ids()})`,
    params.values()
  );
}

describe("auth", () => {
  before(async () => {
    await recreateDb(dbConfig);
    psy.createPool(dbConfig);
    const queries = await setup();
    const pool = await psy.getPool(dbConfig);
    for (const sql of queries) {
      await pool.query(sql);
    }
  });

  accountCreationAndRenameTests();
  accountSettingsTests();
  statusCheckTests();
  accountDetailsTests();
  activationTests();
  managePermissionsTests();
});
