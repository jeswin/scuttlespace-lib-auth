import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../../";
import { dbConfig, getCallContext, insertUser, user1 } from "../test";

export default function() {
  describe("user creation and renaming", () => {
    it("creates a new user (CREATED)", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      const userInfo = {
        externalId: "jpk001",
        username: "jeswin"
      };
      const result = await auth.createOrRenameUser(userInfo, getCallContext());
      result.type.should.equal("data");
      (result as any).data.should.equal("CREATED");

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
        username: "jes"
      };
      const result = await auth.createOrRenameUser(userInfo, getCallContext());
      result.type.should.equal("data");
      (result as any).data.should.equal("RENAMED");

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
        username: "jeswin"
      };
      const result = await auth.createOrRenameUser(userInfo, getCallContext());

      result.type.should.equal("data");
      (result as any).data.should.equal("OWN");
    });

    it("does not create if username is in use (TAKEN)", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);

      const userInfo = {
        externalId: "alice001",
        username: "jeswin"
      };
      const result = await auth.createOrRenameUser(userInfo, getCallContext());

      result.type.should.equal("data");
      (result as any).data.should.equal("TAKEN");
    });
  });
}
