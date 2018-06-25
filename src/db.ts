import pg from "psychopiggy";

export interface IDbConfig {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
}

export async function init(dbConfig: IDbConfig) {
  if (await !databaseExists(dbConfig)) {
    await createDatabase(dbConfig);
  }
}

export async function databaseExists(dbConfig: IDbConfig) {
  return true;
}

export async function createDatabase(dbConfig: IDbConfig) {
  const sql = `CREATE DATABASE ${dbConfig.database}`;
}

export async function createTable(table: string, createStatement: string) {
  const db = await getDb();
  db.prepare(createStatement).run();
  log(`Created ${table} table.`);
}

export async function createIndexes(table: string, fields: string[]) {
  const indexName = `${table}_${fields.join("_")}`;
  const db = await getDb();
  db.prepare(
    `CREATE INDEX ${indexName} ON ${table}(${fields.join(", ")})`
  ).run();
  log(`Created index ${indexName} ON ${table}(${fields.join(", ")}).`);
}
