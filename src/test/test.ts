import "mocha";
import "should";

import * as db from "../db";
// import setup from "../setup";

function getEnvValue(envVar: string): string | never {
  const val = process.env[envVar];
  if (typeof val === "undefined") {
    throw new Error(`Expected ${envVar} to be defined.`);
  }
  return val;
}

function getDbConfig(): db.IDbConfig {
  const dbConfig = {
    database: getEnvValue("SCUTTLESPACE_DB_NAME"),
    host: getEnvValue("SCUTTLESPACE_DB_HOST"),
    password: getEnvValue("SCUTTLESPACE_DB_PASSWORD"),
    port: parseInt(getEnvValue("SCUTTLESPACE_DB_PORT"), 10),
    user: getEnvValue("SCUTTLESPACE_DB_USER")
  };
  return dbConfig;
}

describe("auth", () => {
  before(async () => {
    console.log(getDbConfig());
    await db.init(getDbConfig());
  });

  it("sets up tables", async () => {
   //  await setup();
  });
});
