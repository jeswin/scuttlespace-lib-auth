import "mocha";
import * as psy from "psychopiggy";
import "should";
import * as auth from "../../";
import { dbConfig, getCallContext, insertUser, user1 } from "../test";

export default function() {
  describe("user settings", () => {
    it("sets the about", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);
      await auth.editUserAbout("Hello world", "jpk001", getCallContext());

      const { rows } = await pool.query(
        `SELECT * FROM scuttlespace_user WHERE external_id='jpk001'`
      );

      rows.length.should.equal(1);
      rows[0].about.should.equal("Hello world");
    });

    it("sets the domain", async () => {
      const pool = psy.getPool(dbConfig);

      // clean up
      await pool.query(`DELETE FROM scuttlespace_user`);

      await insertUser(user1, pool);
      await auth.editUserDomain("jeswin.org", "jpk001", getCallContext());

      const { rows } = await pool.query(
        `SELECT * FROM scuttlespace_user WHERE external_id='jpk001'`
      );

      rows.length.should.equal(1);
      rows[0].domain.should.equal("jeswin.org");
    });
  });
}
