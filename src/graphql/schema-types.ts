export interface IScuttlespaceUserDTO {
  about: string | undefined;
  domain: string | undefined;
  enabled: boolean;
  externalId: string;
  pub: string;
  rowid: string;
  username: string;
  permissions: Array<IPermissionDTO> | undefined;
}

export interface IPermissionDTO {
  rowid: string;
  assigner: IScuttlespaceUserDTO;
  assignee: IScuttlespaceUserDTO;
  permissions: string | undefined;
}

export interface IGetUserArgsDTO {
  rowid?: string | undefined;
  domain?: string | undefined;
}

export interface ICreateOrRenameUserArgs {
  externalId?: string | undefined;
  username?: string | undefined;
}
