import exception from "../exception";
import { createOrRenameUser, findUser, IGetUserResult } from "../user";
import * as schema from "./schema-types";
import { parseServiceResult } from "scuttlespace-api-common";

export default {
  Mutation: {
    async createOrRenameUser(
      root: any,
      args: schema.ICreateOrRenameUserArgs,
      context: any
    ): Promise<string | undefined> {
      const result = await createOrRenameUser(args, context);
      return await parseServiceResult(result);
    }
  },
  Query: {
    async user(
      root: any,
      args: { domain: string; rowid: string },
      context: any
    ): Promise<schema.IScuttlespaceUserDTO | undefined> {
      const result = await findUser(args, context);
      return await parseServiceResult(result);
    }
  }
};
