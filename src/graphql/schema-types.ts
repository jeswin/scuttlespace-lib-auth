export interface IScuttlespaceUserDTO {
  rowid: string;
  username: string;
  externalId: string;
  enabled: boolean;
  domain: string | undefined;
  about: string | undefined;
  permissions: Array<IPermissionDTO> | undefined;
}

export interface IPermissionDTO {
  rowid: string;
  assigner: IScuttlespaceUserDTO;
  assignee: IScuttlespaceUserDTO;
  permissions: string | undefined;
}

export interface IGetUserArgsDTO {
  rowid: string | undefined;
  domain: string | undefined;
}

export interface ICreateOrRenameUserArgs {
  externalId: string | undefined;
  username: string | undefined;
}
