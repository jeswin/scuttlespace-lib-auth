import exception from "./exception";
import { findUser, IFindUserArgs, IGetUserResult } from "./user";

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
`,
  `
  type CreateOrRenameUserArgs {
    externalId String
    username String
  }
  `,
  `extend type Mutation {
    createOrRenameUser(args: CreateOrRenameUserArgs): 
  }`
];

export const resolvers = {
  Query: {
    async user(
      root: any,
      args: IFindUserArgs,
      context: any
    ): Promise<IGetUserResult | undefined> {
      const result = await findUser(args, context);
      return result.type === "data"
        ? result.data
        : exception(result.error.code, result.error.message);
    }
  },
  Mutation: {}
};
