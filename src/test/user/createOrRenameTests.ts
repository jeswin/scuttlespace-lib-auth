import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../..";
import { dbConfig, getCallContext, insertUser, user1 } from "../test";

export default function() {
  describe("user creation and renaming", () => {
    it("creates a new user (CREATED)", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      const userInfo = {
        externalId: "jpk001",
        pub: "hackers",
        username: "jeswin"
      };

      const result = await auth.createOrRenameUser(
        { input: userInfo },
        getCallContext()
      );
      result.type.should.equal("data");
      (result as any).data.should.deepEqual({
        externalId: "jpk001",
        status: "Created"
      });

      const { rows } = await pool.query(`SELECT * FROM scuttlespace_user`);
      rows.length.should.equal(1);
      rows[0].username.should.equal("jeswin");
    });

    it("renames if user exists (RENAMED)", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);

      const userInfo = {
        externalId: "jpk001",
        pub: "hackers",
        username: "jes"
      };
      const result = await auth.createOrRenameUser(
        { input: userInfo },
        getCallContext()
      );
      result.type.should.equal("data");
      (result as any).data.should.deepEqual({
        externalId: "jpk001",
        status: "Renamed"
      });

      const { rows } = await pool.query(`SELECT * FROM scuttlespace_user`);
      rows.length.should.equal(1);
      rows[0].username.should.equal("jes");
    });

    it("does not rename if oneself (OWN)", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);

      const userInfo = {
        externalId: "jpk001",
        pub: "hackers",
        username: "jeswin"
      };
      const result = await auth.createOrRenameUser(
        { input: userInfo },
        getCallContext()
      );

      result.type.should.equal("data");
      (result as any).data.should.deepEqual({
        externalId: "jpk001",
        status: "Own"
      });
    });

    it("does not create if username is in use (TAKEN)", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);

      const userInfo = {
        externalId: "alice001",
        pub: "hackers",
        username: "jeswin"
      };
      const result = await auth.createOrRenameUser(
        { input: userInfo },
        getCallContext()
      );

      result.type.should.equal("data");
      (result as any).data.should.deepEqual({
        externalId: "alice001",
        status: "Taken"
      });
    });
  });
}
