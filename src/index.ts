export { default as setup } from "./setup";

export { default as addPermissions } from "./manage-permissions";

export {
  default as checkAccountStatus,
  IAccountStatusCheckResult
} from "./check-account-status";

export { default as createOrRename } from "./create-account";

export {
  getAccountByExternalUsername,
  getAccountByUsername
} from "./get-account";

export * from "./manage-permissions";
export * from "./modify-account";
