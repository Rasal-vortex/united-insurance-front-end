export const PERMISSIONS = {
  CAN_MANAGE_BRANCHES: (user) => user?.userType === "ADMIN",
  CAN_CREATE_BRANCH: (user) => user?.userType === "ADMIN",
  CAN_VIEW_ALL_BRANCHES: (user) => user?.userType === "ADMIN",
  CAN_READ_CRM: (user) => user?.userType === "ADMIN" || user?.userType === "BRANCH",
  CAN_WRITE_CRM: (user) => user?.userType === "BRANCH",
  CAN_VIEW_REPORTS: (user) => user?.userType === "ADMIN" || user?.userType === "BRANCH"
};

const ADMIN_ONLY_PATHS = new Set(["/admin/branches", "/branches"]);
const ADMIN_LOGIN_PATHS = new Set(["/auth/admin-login", "/(auth)/admin-login"]);
const BRANCH_LOGIN_PATHS = new Set(["/auth/branch-login", "/(auth)/branch-login"]);

export function canAccessRoute(userType, pathname) {
  if (userType !== "ADMIN" && userType !== "BRANCH") return false;
  if (ADMIN_ONLY_PATHS.has(pathname)) return userType === "ADMIN";
  if (ADMIN_LOGIN_PATHS.has(pathname)) return userType === "ADMIN";
  if (BRANCH_LOGIN_PATHS.has(pathname)) return userType === "BRANCH";
  return true;
}
