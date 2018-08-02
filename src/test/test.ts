import "mocha";
import pg = require("pg");
import * as psy from "psychopiggy";
import "should";
import * as auth from "..";
import setup from "../setup";

import activationTests from "./user/activation-tests";
import userCreationAndRenameTests from "./user/creation-or-rename-tests";
import userDetailsTests from "./user/details-tests";
import userSettingsTests from "./user/settings-tests";
import statusCheckTests from "./user/status-check-tests";

import addPermissionsTests from "./permissions/add-tests";
import clearPermissionsTests from "./permissions/clear-tests";
import getPermissionsTests from "./permissions/get-tests";

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

export function getCallContext() {
  return { id: "TEST_RUN", session: "TEST_SESSION" };
}

async function recreateDb(config: psy.IDbConfig) {
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
  external_id: "jpk001",
  username: "jeswin"
};

export const user2 = {
  about: "bazinga!",
  domain: "example.com",
  enabled: true,
  external_id: "gp001",
  username: "geospeed"
};

export const user3 = {
  about: "imoku soso",
  domain: "th.example.com",
  enabled: true,
  external_id: "th001",
  username: "thommi"
};

export async function insertUser(user: any, pool: pg.Pool) {
  const params = new psy.Params(user);
  await pool.query(
    `INSERT INTO scuttlespace_user (${params.columns()}) VALUES(${params.ids()})`,
    params.values()
  );
}

export const permissions1 = {
  assignee_external_id: "gp001",
  assigner_external_id: "jpk001",
  permissions: "learning:read,pub:read,pub:write"
};

export const permissions2 = {
  assignee_external_id: "th001",
  assigner_external_id: "jpk001",
  permissions: "pub:read"
};

export async function insertPermissions(
  permissions: typeof permissions1,
  pool: pg.Pool
) {
  const params = new psy.Params(permissions);
  await pool.query(
    `INSERT INTO user_permissions (${params.columns()}) VALUES(${params.ids()})`,
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
    await auth.init(getDbConfig());
  });

  userCreationAndRenameTests();
  userSettingsTests();
  statusCheckTests();
  userDetailsTests();
  activationTests();

  getPermissionsTests();
  addPermissionsTests();
  clearPermissionsTests();
});
