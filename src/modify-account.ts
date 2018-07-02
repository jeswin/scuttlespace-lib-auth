import pg = require("pg");
import * as psy from "psychopiggy";

export async function editAbout(
  about: string,
  sender: string,
  pool: pg.Pool
): Promise<void> {
  const params = new psy.Params({ about, network_id: sender });
  await pool.query(
    `
        UPDATE account SET about=${params.id(
          "about"
        )} WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
}

export async function editDomain(
  domain: string,
  sender: string,
  pool: pg.Pool
): Promise<void> {
  const params = new psy.Params({ domain, network_id: sender });
  await pool.query(
    `
    UPDATE account SET domain=${params.id(
      "domain"
    )} WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
}

export async function editUsername(
  username: string,
  sender: string,
  pool: pg.Pool
): Promise<void> {
  const params = new psy.Params({ username, network_id: sender });
  await pool.query(
    `
        UPDATE account SET username=${params.id(
          "username"
        )} WHERE network_id=${params.id("network_id")}`,
    params.values()
  );
}

export async function enable(sender: string, pool: pg.Pool): Promise<void> {
  const params = new psy.Params({ network_id: sender });
  await pool.query(
    `UPDATE account SET enabled=true WHERE network_id=${params.id(
      "network_id"
    )}`,
    params.values()
  );
}

export async function disable(sender: string, pool: pg.Pool): Promise<void> {
  const params = new psy.Params({ network_id: sender });
  await pool.query(
    `UPDATE account SET enabled=false WHERE network_id=${params.id(
      "network_id"
    )}`,
    params.values()
  );
}
