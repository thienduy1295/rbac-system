import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Permission } from "@/models/Permission";
import { Types } from "mongoose";

// Đảm bảo models được register trước khi populate
import "@/models/Group";
import "@/models/Permission";
import "@/models/Role";

// ── Local lean types — mô tả kết quả thực tế sau .populate().lean() ──────

type LeanRole = { name: string };

type LeanPermission = { name: string };

type LeanGroup = { _id: Types.ObjectId; permissions: LeanPermission[] };

type UserLeanWithRole = {
  groups: Types.ObjectId[];
  role: LeanRole;
};

type UserLeanGroupsOnly = {
  groups: Types.ObjectId[];
};

type UserLeanWithGroupsPopulated = {
  role: LeanRole;
  groups: LeanGroup[];
};

// ── Exported functions ─────────────────────────────────────────────────────

export function checkPermission(
  userPermissions: string[],
  permission: string,
  isSuperAdmin: boolean,
): boolean {
  if (isSuperAdmin) return true;
  return userPermissions.includes(permission);
}

export async function getUserRole(userId: string) {
  await connectDB();
  const user = await User.findById(userId).populate("role").lean();
  if (!user) return null;
  return user.role;
}

// Lấy toàn bộ permission names của user (dùng chung cho mọi check)
export async function getUserPermissions(userId: string): Promise<string[]> {
  await connectDB();

  const user = (await User.findById(userId)
    .populate("role")
    .populate({ path: "groups", populate: { path: "permissions" } })
    .lean()) as UserLeanWithGroupsPopulated | null;

  if (!user) return [];

  if (user.role?.name === "super_admin") {
    const allPermissions = await Permission.find().lean();
    return allPermissions.map((p) => p.name);
  }

  const permissions = new Set<string>();
  for (const group of user.groups ?? []) {
    for (const permission of group.permissions ?? []) {
      permissions.add(permission.name);
    }
  }

  return Array.from(permissions);
}

// Lấy role + groupIds + permissionNames trong 1 DB query duy nhất
export async function getUserContext(userId: string): Promise<{
  role: LeanRole | null;
  groupIds: string[];
  permissionNames: string[];
  isSuperAdmin: boolean;
}> {
  await connectDB();

  const user = (await User.findById(userId)
    .populate("role")
    .populate({ path: "groups", populate: { path: "permissions" } })
    .lean()) as UserLeanWithGroupsPopulated | null;

  if (!user) {
    return { role: null, groupIds: [], permissionNames: [], isSuperAdmin: false };
  }

  const isSuperAdmin = user.role?.name === "super_admin";

  let permissionNames: string[];
  if (isSuperAdmin) {
    const allPermissions = await Permission.find().lean();
    permissionNames = allPermissions.map((p) => p.name);
  } else {
    const perms = new Set<string>();
    for (const group of user.groups ?? []) {
      for (const perm of group.permissions ?? []) {
        perms.add(perm.name);
      }
    }
    permissionNames = Array.from(perms);
  }

  const groupIds = (user.groups ?? []).map((g) => g._id.toString());

  return { role: user.role ?? null, groupIds, permissionNames, isSuperAdmin };
}

// Check 1 permission — dùng 1 DB query duy nhất
export async function hasPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

// Check phải có TẤT CẢ permissions
export async function hasAllPermissions(
  userId: string,
  requiredPermissions: string[],
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return requiredPermissions.every((p) => permissions.includes(p));
}

// Check có ÍT NHẤT 1 trong các permissions
export async function hasAnyPermission(
  userId: string,
  requiredPermissions: string[],
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return requiredPermissions.some((p) => permissions.includes(p));
}

// Kiểm tra user có được phép sửa group này không
export async function canModifyGroup(
  userId: string,
  groupId: string,
): Promise<boolean> {
  await connectDB();

  const user = (await User.findById(userId)
    .populate("role")
    .lean()) as UserLeanWithRole | null;

  if (!user) return false;

  // Super admin được phép tất cả
  if (user.role?.name === "super_admin") return true;

  // User KHÔNG được sửa group mà mình đang thuộc về
  const userGroupIds = (user.groups ?? []).map((g) => g.toString());
  if (userGroupIds.includes(groupId)) return false;

  // Phải có quyền groups:update
  const permissions = await getUserPermissions(userId);
  return permissions.includes("groups:update");
}

// Kiểm tra user có thể assign các permissions này không (không được cấp quyền cao hơn mình)
export async function canAssignPermissions(
  userId: string,
  permissionIds: string[],
): Promise<boolean> {
  await connectDB();

  const user = (await User.findById(userId)
    .populate("role")
    .lean()) as UserLeanWithRole | null;

  if (!user) return false;

  if (user.role?.name === "super_admin") return true;

  const userPermissions = await getUserPermissions(userId);

  const permissionsToAssign = await Permission.find({
    _id: { $in: permissionIds },
  }).lean();

  const namesToAssign = permissionsToAssign.map((p) => p.name);

  // Chỉ được assign permissions mà mình đang có
  return namesToAssign.every((name) => userPermissions.includes(name));
}

// Lấy groupIds user đang thuộc về
export async function getUserGroupIds(userId: string): Promise<string[]> {
  await connectDB();
  const user = (await User.findById(
    userId,
  ).lean()) as UserLeanGroupsOnly | null;
  if (!user) return [];
  return (user.groups ?? []).map((g) => g.toString());
}
