import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../../";
import { dbConfig, getCallContext, insertUser, user1 } from "../test";

export default function() {
  describe("status check", () => {
    it("returns account status as 'AVAILABLE' if username does not exist", async () => {
      const pool = psy.getPool(dbConfig);
      await auth.getUsernameAvailability("jeswin", "jpk001", pool, getCallContext());
    });

    it("returns account status as 'OWN' if username belongs to user", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      const params = new psy.Params({
        about: "hal9000 supervisor",
        domain: "jeswin.org",
        enabled: true,
        external_username: "jpk001",
        username: "jeswin"
      });
      await pool.query(
        `INSERT INTO account (${params.columns()}) VALUES(${params.ids()})`,
        params.values()
      );

      const result = await auth.getUsernameAvailability(
        "jeswin",
        "jpk001",
        pool,
        getCallContext()
      );

      result.type.should.equal("data");
      if (result.type === "data") {
        result.data.status.should.equal("OWN");
      }
    });

    it("returns account status as 'TAKEN' if username is in use", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      const result = await auth.getUsernameAvailability(
        "jeswin",
        "alice001",
        pool,
        getCallContext()
      );

      result.type.should.equal("data");
      if (result.type === "data") {
        result.data.status.should.equal("TAKEN");
      }
    });
  });
}
