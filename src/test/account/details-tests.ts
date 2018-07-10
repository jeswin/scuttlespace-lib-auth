import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../../";
import { dbConfig, getCallContext, insertUser, user1 } from "../test";

const shouldLib = require("should");

export default function() {
  describe("status check", () => {
    it("gets account details by external_id", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      const result = await auth.getAccountByExternalId(
        "jpk001",
        getCallContext()
      );
      shouldLib.exist(result);
      (result as any).data.should.deepEqual({
        about: "hal9000 supervisor",
        domain: "jeswin.org",
        enabled: true,
        externalId: "jpk001",
        username: "jeswin"
      });
    });

    it("gets account details by username", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      const result = await auth.getAccountByUsername(
        "jeswin",
        getCallContext()
      );
      shouldLib.exist(result);
      (result as any).data.should.deepEqual({
        about: "hal9000 supervisor",
        domain: "jeswin.org",
        enabled: true,
        externalId: "jpk001",
        username: "jeswin"
      });
    });

    it("gets no account details of caller if account missing", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      const result = await auth.getAccountByExternalId(
        "boom1",
        getCallContext()
      );
      shouldLib.not.exist((result as any).data);
    });
  });
}
