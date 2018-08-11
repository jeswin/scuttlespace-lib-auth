export default `
  type ScuttlespaceUserDTO {
    about: String
    domain: String
    enabled: Boolean!
    externalId: String!
    pub: String!
    rowid: ID!
    username: String!
    permissions: [PermissionDTO]
  }

  type PermissionDTO {
    rowid: ID!
    assigner: ScuttlespaceUserDTO!
    assignee: ScuttlespaceUserDTO!
    permissions: String
  }

  extend type Query {
    user(domain: String, username: String): ScuttlespaceUserDTO
  }

  input CreateOrRenameUserArgs {
    externalId: String!
    pub: String!
    username: String!
  }
  
  extend type Mutation {
    createOrRenameUser(input: CreateOrRenameUserArgs): String!
  }
`;
