import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../../";
import { dbConfig, getCallContext, insertUser, user1 } from "../test";

export default function() {
  describe("activation", () => {
    it("enables", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser({ ...user1, enabled: false }, pool);
      const apiResult = await auth.enableAccount("jpk001", getCallContext());
      (apiResult as any).data.username.should.equal("jeswin");

      const { rows } = await pool.query(
        `SELECT * FROM account WHERE external_id='jpk001'`
      );

      rows.length.should.equal(1);
      rows[0].enabled.should.be.true();
    });

    it("disables", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      const apiResult = await auth.disableAccount("jpk001", getCallContext());
      (apiResult as any).data.username.should.equal("jeswin");

      const { rows } = await pool.query(
        `SELECT * FROM account WHERE external_id='jpk001'`
      );

      rows.length.should.equal(1);
      rows[0].enabled.should.be.false();
    });

    it("destroys", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser({ ...user1, enabled: false }, pool);
      const apiResult = await auth.destroyAccount("jpk001", getCallContext());
      (apiResult as any).data.username.should.equal("jeswin");

      const { rows } = await pool.query(
        `SELECT * FROM account WHERE external_id='jpk001'`
      );

      rows.length.should.equal(0);
    });

    it("does not destroy if account status is active", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);

      const result = await auth.destroyAccount("jpk001", getCallContext());
      result.type.should.equal("error");
      if (result.type === "error") {
        result.error.code.should.equal("CANNOT_DELETE_ACTIVE_ACCOUNT");
        result.error.message.should.equal(
          "An account in active status cannot be deleted."
        );
      }
    });
  });
}
