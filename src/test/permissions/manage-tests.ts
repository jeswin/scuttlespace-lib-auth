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
  user2
} from "../test";

export default function() {
  describe("manage permissions", () => {
    it("gets permissions", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account_permissions`);
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);
      await insertPermissions(permissions1, pool);

      const result = await auth.getPermissions(
        "jpk001",
        pool,
        getCallContext()
      );

      (result as any).data.permissions.should.deepEqual([
        {
          assigneeExternalId: undefined,
          externalId: "jpk001",
          permissions: undefined
        }
      ]);
    });

    it("adds new permissions", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account_permissions`);
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);

      await auth.setPermissions(
        "gp001",
        "jpk001",
        ["write"],
        pool,
        getCallContext()
      );

      const { rows } = await pool.query(`SELECT * FROM account_permissions`);
      rows.length.should.equal(1);
      rows.should.match([
        {
          assignee_external_id: "gp001",
          external_id: "jpk001",
          permissions: "write"
        }
      ]);
    });

    it("updates permissions", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM account_permissions`);
      await pool.query(`DELETE FROM account`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);
      insertPermissions(permissions1, pool);

      await auth.setPermissions(
        "gp001",
        "jpk001",
        ["read", "delete"],
        pool,
        getCallContext()
      );

      const { rows } = await pool.query(`SELECT * FROM account_permissions`);
      rows.length.should.equal(1);
      rows.should.match([
        {
          assignee_external_id: "gp001",
          external_id: "jpk001",
          permissions: "read,delete"
        }
      ]);
    });
  });
}
