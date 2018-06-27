import pg = require("pg");
import * as psy from "psychopiggy";

export default async function changeUsername(
  from: string,
  to: string,
  callerNetworkId: string,
  pool: pg.Pool
): Promise<void> {
  const params = new psy.Params({
    from,
    network_id: callerNetworkId
  });
  // check if the username belongs to the networkId
  const { rows: existing } = await pool.query(
    `
    SELECT * FROM account 
    WHERE 
      username=${params.id("from")} AND 
      network_id=${params.id("network_id")}`,
    params.values()
  );

  const updateParams = new psy.Params({
    from,
    network_id: callerNetworkId,
    to
  });

  if (existing.length === 1) {
    await pool.query(
      `
      UPDATE account 
      SET 
        username=${updateParams.id("to")} 
      WHERE 
        username=${updateParams.id("from")} AND
        network_id=${updateParams.id("network_id")}`,
      updateParams.values()
    );
  }
}
