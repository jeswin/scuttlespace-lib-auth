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

  input GetUserArgsDTO {
    rowid: String
    domain: String
  }

  extend type Query {
    user(args: GetUserArgsDTO!): ScuttlespaceUserDTO
  }

  input CreateOrRenameUserArgs {
    externalId: String
    username: String
  }

  extend type Mutation {
    createOrRenameUser(args: CreateOrRenameUserArgs): String
  }
`;
