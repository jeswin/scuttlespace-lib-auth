// import { createIndexes, createTable } from "./db";

// export default async function setup() {
//   await createTable(
//     "identity",
//     `CREATE TABLE account (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT NOT NULL,
//         network_id TEXT NOT NULL,
//         enabled INTEGER NOT NULL,
//         domain TEXT,
//         about TEXT,
//         CONSTRAINT unique_identity_id UNIQUE (id),
//         CONSTRAINT unique_identity_domain UNIQUE (domain)
//       )`
//   );

//   await createIndexes("account", ["id"]);
//   await createIndexes("account", ["network_id"]);
//   await createIndexes("account", ["domain"]);

//   await createTable(
//     "membership",
//     `CREATE TABLE membership ( 
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT NOT NULL,
//         user_id TEXT NOT NULL,
//         membership_type INTEGER NOT NULL,
//         FOREIGN KEY(account_username) REFERENCES identity(username)
//     )`
//   );

//   await createIndexes("membership", ["account_username"]);
// }
