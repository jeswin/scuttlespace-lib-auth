import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../../";
import {
  dbConfig,
  getCallContext,
  insertPermissions,
  insertUser,
  permissions1,
  permissions2,
  user1,
  user2,
  user3
} from "../test";

export default function() {
  describe("clear permissions", () => {
    it("clears by module name", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account_permissions`);
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);
      await insertUser(user3, pool);
      await insertPermissions(permissions1, pool);
      await insertPermissions(permissions2, pool);

      await auth.clearPermissions(
        "pub",
        "gp001",
        "jpk001",
        pool,
        getCallContext()
      );

      const { rows } = await pool.query(
        `SELECT * FROM account_permissions WHERE assignee_external_id='gp001'`
      );
      rows.length.should.equal(1);
      rows.should.match([
        {
          assignee_external_id: "gp001",
          external_id: "jpk001",
          permissions: "learning:read"
        }
      ]);
    });
  });
}
