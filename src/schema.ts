export default `
  extend type Query {
    user(domain: String, externalId: String, username: String): ScuttlespaceUserDTO
  }

  extend type Mutation {
    createOrRenameUser(input: CreateOrRenameUserArgs): CreateOrRenameUserResult!
    enableUser(input: ChangeUserStatusArgs): ChangeUserStatusResult!
    disableUser(input: ChangeUserStatusArgs): ChangeUserStatusResult!
    destroyUser(input: ChangeUserStatusArgs): ChangeUserStatusResult!
  }
`;
