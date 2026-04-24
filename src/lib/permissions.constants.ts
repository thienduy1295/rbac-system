export const PERMISSIONS = {
  // Groups
  GROUPS_CREATE: "groups:create",
  GROUPS_READ: "groups:read",
  GROUPS_UPDATE: "groups:update",
  GROUPS_DELETE: "groups:delete",

  // Users
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",

  // Permissions
  PERMISSIONS_READ: "permissions:read",

  // Departments
  DEPARTMENTS_CREATE: "departments:create",
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_UPDATE: "departments:update",
  DEPARTMENTS_DELETE: "departments:delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
