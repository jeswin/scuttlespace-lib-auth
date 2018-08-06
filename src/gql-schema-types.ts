export interface IScuttlespaceUser {
  __typename: "ScuttlespaceUser";
  rowid: string;
  username: string;
  external_id: string;
  enabled: boolean;
  domain: string | null;
  about: string | null;
  permissions: Array<IPermission> | null;
}

export interface IPermission {
  __typename: "Permission";
  rowid: string;
  assigner: IScuttlespaceUser;
  assignee: IScuttlespaceUser;
  permissions: string | null;
}

export interface ICreateOrRenameUserArgs {
  __typename: "CreateOrRenameUserArgs";
  externalId: string | null;
  username: string | null;
}
