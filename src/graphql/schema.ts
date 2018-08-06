export default `
  type ScuttlespaceUserDTO {
    rowid: ID!
    username: String!
    externalId: String!
    enabled: Boolean!
    domain: String
    about: String
    permissions: [PermissionDTO]
  }

  type PermissionDTO {
    rowid: ID!
    assigner: ScuttlespaceUserDTO!
    assignee: ScuttlespaceUserDTO!
    permissions: String
  }

  type GetUserArgsDTO {
    rowid: String
    domain: String
  }

  extend type Query {
    user(args: GetUserArgsDTO!): ScuttlespaceUserDTO
  }

  type CreateOrRenameUserArgs {
    externalId: String
    username: String
  }

  extend type Mutation {
    createOrRenameUser(args: CreateOrRenameUserArgs): String
  }
`;
