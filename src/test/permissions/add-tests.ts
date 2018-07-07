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
  user1,
  user2,
} from "../test";

export default function() {
  describe("update permissions", () => {
    it("creates a new permission", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account_permissions`);
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);

      await auth.addPermissions(
        "gp001",
        "jpk001",
        [{ module: "pub", permission: "del" }],
        pool,
        getCallContext()
      );

      const { rows } = await pool.query(`SELECT * FROM account_permissions`);
      rows.length.should.equal(1);
      rows.should.match([
        {
          assignee_external_id: "gp001",
          external_id: "jpk001",
          permissions: "pub:del"
        }
      ]);
    });

    it("appends new permissions", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account_permissions`);
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);
      await insertPermissions(permissions1, pool);

      await auth.addPermissions(
        "gp001",
        "jpk001",
        [
          { module: "pub", permission: "read" },
          { module: "pub", permission: "full" },
          { module: "pub", permission: "admin" }
        ],
        pool,
        getCallContext()
      );

      const { rows } = await pool.query(`SELECT * FROM account_permissions`);
      rows.length.should.equal(1);
      rows[0].should.containEql({
        assignee_external_id: "gp001",
        external_id: "jpk001",
        permissions: "learning:read,pub:admin,pub:full,pub:read,pub:write"
      });
    });
  });
}
