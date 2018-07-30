import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../..";
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
  describe("get permissions", () => {
    it("gets all", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM user_permissions`);
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);
      await insertUser(user3, pool);
      await insertPermissions(permissions1, pool);
      await insertPermissions(permissions2, pool);

      const result = await auth.getPermissions("jpk001", getCallContext());

      (result as any).data.should.deepEqual([
        {
          assigneeExternalId: "gp001",
          assignerExternalId: "jpk001",
          permissions: [
            { module: "learning", permission: "read" },
            { module: "pub", permission: "read" },
            { module: "pub", permission: "write" }
          ]
        },
        {
          assigneeExternalId: "th001",
          assignerExternalId: "jpk001",
          permissions: [{ module: "pub", permission: "read" }]
        }
      ]);
    });

    it("gets permissions of a user", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM user_permissions`);
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);
      await insertUser(user2, pool);
      await insertUser(user3, pool);
      await insertPermissions(permissions1, pool);
      await insertPermissions(permissions2, pool);

      const result = await auth.getPermissionsForUser(
        "th001",
        "jpk001",
        getCallContext()
      );

      (result as any).data.should.deepEqual({
        assigneeExternalId: "th001",
        assignerExternalId: "jpk001",
        permissions: [{ module: "pub", permission: "read" }]
      });
    });
  });
}
