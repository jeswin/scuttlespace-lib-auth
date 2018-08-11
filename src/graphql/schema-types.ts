export interface IScuttlespaceUserDTO {
  about?: string;
  domain?: string;
  enabled: boolean;
  externalId: string;
  pub: string;
  rowid: string;
  username: string;
  permissions?: Array<IPermissionDTO>;
}

export interface IPermissionDTO {
  rowid: string;
  assigner: IScuttlespaceUserDTO;
  assignee: IScuttlespaceUserDTO;
  permissions?: string;
}

export interface ICreateOrRenameUserArgs {
  externalId: string;
  pub: string;
  username: string;
}
