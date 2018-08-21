import { parseServiceResult } from "scuttlespace-service-common";
import { types } from "scuttlespace-service-user-graphql-schema";
import exception from "./exception";
import { createOrRenameUser, findUser, IGetUserResult } from "./user";

export default {
  Mutation: {
    async createOrRenameUser(
      root: any,
      args: { input: types.ICreateOrRenameUserArgs },
      context: any
    ): Promise<string | undefined> {
      const result = await createOrRenameUser(args.input, context);
      return await parseServiceResult(result);
    },
    async enableUser()
  },
  Query: {
    async user(
      root: any,
      args: { domain: string; rowid: string },
      context: any
    ): Promise<types.IScuttlespaceUserDTO | undefined> {
      const result = await findUser(args, context);
      return await parseServiceResult(result);
    }
  }
};
