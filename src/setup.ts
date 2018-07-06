export default async function setup() {
  const account = [
    `CREATE TABLE account (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(64) UNIQUE NOT NULL,
      external_username VARCHAR(64) UNIQUE NOT NULL,
      enabled BOOLEAN NOT NULL,
      domain VARCHAR(64),
      about TEXT
    )`,
    `CREATE INDEX account_username_index ON account(username)`,
    `CREATE INDEX account_external_username_index ON account(external_username)`,
    `CREATE INDEX account_domain_index ON account(domain)`
  ];

  const accountPermissions = [
    `CREATE TABLE account_permissions ( 
      id BIGSERIAL PRIMARY KEY,
      assignee_external_username VARCHAR(64) NOT NULL REFERENCES account(external_username),
      external_username VARCHAR(64) NOT NULL REFERENCES account(external_username),
      permissions VARCHAR(512) NOT NULL
    )`
  ];

  return account.concat(accountPermissions);
}
