export default async function setup() {
  const account = [
    `CREATE TABLE account (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(64) UNIQUE NOT NULL,
      network_id VARCHAR(64) UNIQUE NOT NULL,
      enabled BOOLEAN NOT NULL,
      domain VARCHAR(64),
      about TEXT
    )`,
    `CREATE INDEX account_username_index ON account(username)`,
    `CREATE INDEX account_network_id_index ON account(network_id)`,
    `CREATE INDEX account_domain_index ON account(domain)`
  ];

  const accountPermissions = [
    `CREATE TABLE account_permissions ( 
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(64) UNIQUE NOT NULL REFERENCES account(username),
      network_id VARCHAR(64) NOT NULL REFERENCES account(network_id),
      permissions VARCHAR(512) NOT NULL
    )`
  ];

  return account.concat(accountPermissions);
}
