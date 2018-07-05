export { default as setup } from "./setup";

export { default as addPermissions } from "./add-permissions";

export {
  default as checkAccountStatus,
  IAccountStatusCheckResult
} from "./check-account-status";

export { default as createOrRename } from "./create-account";

export {
  getAccountByExternalUsername,
  getAccountByUsername
} from "./get-account";

export * from "./modify-account";
