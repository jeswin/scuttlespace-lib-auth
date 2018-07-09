export default async function setup() {
  const account = [
    `CREATE TABLE account (
      rowid BIGSERIAL PRIMARY KEY,
      username VARCHAR(64) UNIQUE NOT NULL,
      external_id VARCHAR(64) UNIQUE NOT NULL,
      enabled BOOLEAN NOT NULL,
      domain VARCHAR(128),
      about TEXT
    )`,
    `CREATE INDEX account_username_index ON account(username)`,
    `CREATE INDEX account_external_id_index ON account(external_id)`,
    `CREATE INDEX account_domain_index ON account(domain)`
  ];

  const accountPermissions = [
    `CREATE TABLE account_permissions ( 
      rowid BIGSERIAL PRIMARY KEY,
      assignee_external_id VARCHAR(64) NOT NULL REFERENCES account(external_id),
      external_id VARCHAR(64) NOT NULL REFERENCES account(external_id),
      permissions TEXT NOT NULL
    )`
  ];

  return account.concat(accountPermissions);
}
