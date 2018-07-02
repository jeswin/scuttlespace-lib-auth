import "mocha";
import pg = require("pg");
import * as psy from "psychopiggy";
import "should";
import * as auth from "../";
import setup from "../setup";

const shouldLib = require("should");

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

interface IDbConfig {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
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

function getEnvValue(envVar: string): string | never {
  const val = process.env[envVar];
  if (typeof val === "undefined") {
    throw new Error(`Expected ${envVar} to be defined.`);
  }
  return val;
}

function getDbConfig(): psy.IDbConfig {
  return {
    database: getEnvValue("SCUTTLESPACE_TESTDB_NAME"),
    host: getEnvValue("SCUTTLESPACE_TESTDB_HOST"),
    password: getEnvValue("SCUTTLESPACE_TESTDB_PASSWORD"),
    port: parseInt(getEnvValue("SCUTTLESPACE_TESTDB_PORT"), 10),
    user: getEnvValue("SCUTTLESPACE_TESTDB_USER")
  };
}

const dbConfig = getDbConfig();

const user1 = {
  about: "hal9000 supervisor",
  domain: "jeswin.org",
  enabled: true,
  network_id: "jpk001",
  username: "jeswin"
};

const user2 = {
  about: "bazinga!",
  domain: "example.com",
  enabled: true,
  network_id: "gp001",
  username: "geospeed"
};

async function insertUser(user: any, pool: pg.Pool) {
  const params = new psy.Params(user);
  await pool.query(
    `INSERT INTO account (${params.columns()}) VALUES(${params.ids()})`,
    params.values()
  );
}

const permissions1 = {
  network_id: "gp001",
  permissions: "write",
  username: "jeswin"
};

async function insertPermissions(permissions: any, pool: pg.Pool) {
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

  it("returns account status as 'AVAILABLE' if username does not exist", async () => {
    const pool = psy.getPool(dbConfig);
    await auth.checkAccountStatus("jeswin", "jpk001", pool);
  });

  it("returns account status as 'OWN' if username belongs to user", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    const params = new psy.Params({
      about: "hal9000 supervisor",
      domain: "jeswin.org",
      enabled: true,
      network_id: "jpk001",
      username: "jeswin"
    });
    await pool.query(
      `INSERT INTO account (${params.columns()}) VALUES(${params.ids()})`,
      params.values()
    );

    const result = await auth.checkAccountStatus("jeswin", "jpk001", pool);
    result.status.should.equal("OWN");
  });

  it("returns account status as 'TAKEN' if username belongs to user", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    const result = await auth.checkAccountStatus("jeswin", "alice001", pool);
    result.status.should.equal("TAKEN");
  });

  it("gets account details of caller", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    const result = await auth.getAccountForCaller("jpk001", pool);
    shouldLib.exist(result);
    (result as any).should.deepEqual({
      networkId: "jpk001",
      username: "jeswin"
    });
  });

  it("gets no account details of caller if account missing", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    const result = await auth.getAccountForCaller("boom1", pool);
    shouldLib.not.exist(result);
  });

  it("sets the about", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await auth.editAbout("Hello world", "jpk001", pool);

    const { rows } = await pool.query(
      `SELECT * FROM account WHERE network_id='jpk001'`
    );

    rows.length.should.equal(1);
    rows[0].about.should.equal("Hello world");
  });

  it("sets the domain", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await auth.editDomain("jeswin.org", "jpk001", pool);

    const { rows } = await pool.query(
      `SELECT * FROM account WHERE network_id='jpk001'`
    );

    rows.length.should.equal(1);
    rows[0].domain.should.equal("jeswin.org");
  });

  it("changes the username", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await auth.editUsername("furiosan", "jpk001", pool);

    const { rows } = await pool.query(
      `SELECT * FROM account WHERE network_id='jpk001'`
    );

    rows.length.should.equal(1);
    rows[0].username.should.be.equal("furiosan");
  });

  it("enables", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser({ ...user1, enabled: false }, pool);
    await auth.enable("jpk001", pool);

    const { rows } = await pool.query(
      `SELECT * FROM account WHERE network_id='jpk001'`
    );

    rows.length.should.equal(1);
    rows[0].enabled.should.be.true();
  });

  it("disables", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await auth.disable("jpk001", pool);

    const { rows } = await pool.query(
      `SELECT * FROM account WHERE network_id='jpk001'`
    );

    rows.length.should.equal(1);
    rows[0].enabled.should.be.false();
  });

  it("creates a new account", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    const accountInfo = {
      about: "hal9000 supervisor (deceased)",
      domain: "jeswin.org",
      enabled: true,
      networkId: "jpk001",
      username: "jeswin"
    };
    await auth.createAccount(accountInfo, pool);

    const { rows } = await pool.query(`SELECT * FROM account`);
    rows.length.should.equal(1);
    rows[0].about.should.equal("hal9000 supervisor (deceased)");
  });

  it("renames a username", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);

    await auth.changeUsername("jeswin", "hal9kop", "jpk001", pool);

    const { rows } = await pool.query(`SELECT * FROM account`);
    rows.length.should.equal(1);
    rows[0].username.should.equal("hal9kop");
  });

  it("adds new permissions", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account_permissions`);
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await insertUser(user2, pool);

    await auth.addPermissions("jeswin", "gp001", "jpk001", ["write"], pool);

    const { rows } = await pool.query(`SELECT * FROM account_permissions`);
    rows.length.should.equal(1);
    rows.should.match([
      {
        network_id: "gp001",
        permissions: "write",
        username: "jeswin"
      }
    ]);
  });

  it("doesn't add permissions if caller networkId is not matched", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account_permissions`);
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await insertUser(user2, pool);

    let message: string = "";

    try {
      await auth.addPermissions("jeswin", "gp001", "bond001", ["write"], pool);
    } catch (ex) {
      message = ex.message;
    }

    message.should.equal(
      "bond001 cannot manage permissions for username jeswin."
    );
  });

  it("updates permissions", async () => {
    const pool = psy.getPool(dbConfig);

    // clean up
    await pool.query(`DELETE FROM account_permissions`);
    await pool.query(`DELETE FROM account`);

    await insertUser(user1, pool);
    await insertUser(user2, pool);
    await insertPermissions(permissions1, pool);

    await auth.addPermissions(
      "jeswin",
      "gp001",
      "jpk001",
      ["read", "write"],
      pool
    );

    const { rows } = await pool.query(`SELECT * FROM account_permissions`);
    rows.length.should.equal(1);
    rows.should.match([
      {
        network_id: "gp001",
        permissions: "read,write",
        username: "jeswin"
      }
    ]);
  });
});
