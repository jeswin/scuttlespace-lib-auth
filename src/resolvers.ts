import { parseServiceResult } from "scuttlespace-service-common";
import {
  IChangeUserStatusArgs,
  IChangeUserStatusResult,
  ICreateOrRenameUserArgs,
  ICreateOrRenameUserResult,
  IPermission,
  IScuttlespaceUser
} from "scuttlespace-service-user-graphql-schema";
import {
  createOrRenameUser,
  destroyUser,
  disableUser,
  enableUser,
  user
} from "./user";

export default {
  Mutation: {
    async createOrRenameUser(
      root: any,
      args: {
        input: ICreateOrRenameUserArgs;
      },
      context: any
    ): Promise<ICreateOrRenameUserResult> {
      const result = await createOrRenameUser(args, context);
      return await parseServiceResult(result);
    },
    async enableUser(
      root: any,
      args: {
        input: IChangeUserStatusArgs;
      },
      context: any
    ): Promise<IChangeUserStatusResult> {
      const result = await enableUser(args, context);
      return await parseServiceResult(result);
    },
    async disableUser(
      root: any,
      args: {
        input: IChangeUserStatusArgs;
      },
      context: any
    ): Promise<IChangeUserStatusResult> {
      const result = await disableUser(args, context);
      return await parseServiceResult(result);
    },
    async destroyUser(
      root: any,
      args: {
        input: IChangeUserStatusArgs;
      },
      context: any
    ): Promise<IChangeUserStatusResult> {
      const result = await destroyUser(args, context);
      return await parseServiceResult(result);
    }
  },
  Query: {
    async user(
      root: any,
      args: {
        domain: string | undefined;
        externalId: string | undefined;
        username: string | undefined;
      },
      context: any
    ): Promise<IScuttlespaceUser | undefined> {
      const result = await user(args, context);
      return await parseServiceResult(result);
    }
  }
};
