import "mocha";
import "should";

import * as db from "../db";
import setup from "../setup";

function getEnvValue(envVar: string): string | never {
  const val = process.env[envVar];
  if (typeof val === "undefined") {
    throw new Error(`Expected ${envVar} to be defined.`);
  }
  return val;
}

function getDbConfig(): db.IDbConfig {
  const dbConfig = {
    database: getEnvValue("SCUTTLESPACE_DB"),
    host: getEnvValue("SCUTTLESPACE_HOST"),
    password: getEnvValue("SCUTTLESPACE_PASSWORD"),
    port: parseInt(getEnvValue("SCUTTLESPACE_PORT"), 10),
    user: getEnvValue("SCUTTLESPACE_USER")
  };
  return dbConfig;
}

describe("auth", async () => {
  before(async () => {
    await db.init(getDbConfig());
  });

  it("sets up tables", async () => {
    await setup();
  });
});
