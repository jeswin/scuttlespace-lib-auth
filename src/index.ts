export interface IExistingIdentityResult {
  status: "ADMIN" | "MEMBER";
  enabled: boolean;
  identityId: string;
  membershipType: string;
  primaryIdentityName: string;
  userId: string;
}

export type IdentityStatusCheckResult =
  | IExistingIdentityResult
  | { status: "AVAILABLE" }
  | { status: "TAKEN" };

// export async function checkIdentityStatus(
//   identityId: string,
//   sender: string
// ): Promise<IdentityStatusCheckResult> {
//   const db = await getDb();

//   const identity = db
//     .prepare(
//       `SELECT
//         i.enabled as enabled,
//         i.id as identityId,
//         ui.membership_type as membershipType,
//         u.primary_identity_id as primaryIdentityName,
//         u.id as userId
//       FROM membership ui
//       JOIN identity i ON ui.identity_id = i.id
//       JOIN user u on ui.user_id = u.id
//       WHERE identity_id=$identity_id`
//     )
//     .get({ identity_id: identityId });

//   if (!identity) {
//     return { status: "AVAILABLE" };
//   } else {
//     if (identity.userId === sender) {
//       return {
//         enabled: identity.enabled,
//         identityId: identity.identityId,
//         membershipType: identity.membershipType,
//         primaryIdentityName: identity.primaryIdentityName,
//         status: identity.membershipType,
//         userId: identity.userId
//       };
//     } else {
//       return {
//         status: "TAKEN"
//       };
//     }
//   }
// }
