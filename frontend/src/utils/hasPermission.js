import { rolePermissions } from "../config/rolePermissions";

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  return rolePermissions[userRole]?.includes(permission);
};