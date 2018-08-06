import exception from "../exception";
import { findUser, IFindUserArgs, IGetUserResult } from "../user";
import * as schema from "./schema-types";

export default {
  Mutation: {},
  Query: {
    async user(
      root: any,
      args: schema.IGetUserArgsDTO,
      context: any
    ): Promise<schema.IScuttlespaceUserDTO | undefined> {
      const result = await findUser(args, context);
      return result.type === "data"
        ? typeof result.data !== "undefined"
          ? { ...result.data, permissions: undefined }
          : undefined
        : exception(result.error.code, result.error.message);
    }
  }
};
