export const User = `
  type ScuttlespaceUser {
    rowid: ID!
    username: String!
    external_id: String!
    enabled: Boolean!
    domain: String
    about: String
    permissions: [Permission]
  }
`;

export const Permission = `
  type Permission {
    rowid: ID!
    assigner: ScuttlespaceUser!
    assignee: ScuttlespaceUser!
    permissions: String
  }
`;
