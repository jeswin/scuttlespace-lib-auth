import { IFindUserArgs, findUser } from "./user";
import exception from "./exception";

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
    async user(root: any, args: IFindUserArgs, context: any) {
      const result = await findUser(args, context);
      return result.type === "data"
        ? result.data
        : exception(result.error.code, result.error.message);
    }
  }
};
