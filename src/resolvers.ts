import { parseServiceResult } from "scuttlespace-service-common";
import * as  types from "scuttlespace-service-user-graphql-schema";
import { createOrRenameUser, enableUser, findUser } from "./user";

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
    async enableUser(
      root: any,
      args: { input: types.IChangeUserStatusArgs },
      context: any
    ): Promise<types.IChangeUserStatusResult | undefined> {
      const result = await enableUser(args.input.externalId, context);
      return await parseServiceResult(result);
    }
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
