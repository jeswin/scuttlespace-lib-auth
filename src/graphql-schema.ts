export const typeDefs = [
  `
  type ScuttlespaceUser {
    rowid: ID!
    username: String!
    external_id: String!
    enabled: Boolean!
    domain: String
    about: String
    permissions: [Permission]
  }
`,
  `
  type Permission {
    rowid: ID!
    assigner: ScuttlespaceUser!
    assignee: ScuttlespaceUser!
    permissions: String
  }
`,
  `
  extend type Query {
    user(rowid: String, domain: String): ScuttlespaceUser
  }
`
];

export const resolvers = {
  Query: {
    user(root: any, { rowid, domain }: { rowid: string; domain: string }) {
      return { username: "jes" };
    }
  }
};
