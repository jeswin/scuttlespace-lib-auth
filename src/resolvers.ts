import { parseServiceResult } from "scuttlespace-service-common";
import {
  IChangeUserStatusArgs,
  IChangeUserStatusResult,
  ICreateOrRenameUserArgs,
  ICreateOrRenameUserResult,
  IPermissionDTO,
  IScuttlespaceUserDTO
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
        input: ICreateOrRenameUserArgs | null;
      },
      context: any
    ): Promise<ICreateOrRenameUserResult> {
      const result = await createOrRenameUser(args, context);
      return await parseServiceResult(result);
    },
    async enableUser(
      root: any,
      args: {
        input: IChangeUserStatusArgs | null;
      },
      context: any
    ): Promise<IChangeUserStatusResult> {
      const result = await enableUser(args, context);
      return await parseServiceResult(result);
    },
    async disableUser(
      root: any,
      args: {
        input: IChangeUserStatusArgs | null;
      },
      context: any
    ): Promise<IChangeUserStatusResult> {
      const result = await disableUser(args, context);
      return await parseServiceResult(result);
    },
    async destroyUser(
      root: any,
      args: {
        input: IChangeUserStatusArgs | null;
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
        domain: string | null;
        externalId: string | null;
        username: string | null;
      },
      context: any
    ): Promise<IScuttlespaceUserDTO | null> {
      const result = await user(args, context);
      return await parseServiceResult(result);
    }
  }
};
