import {
  searchUsers,
  updateUserGroups,
  findUserById,
  findAllUsers,
  updateUserRole,
  findUsersPaginated,
} from "@/repositories/user.repository";
import { PaginatedResult, TableState } from "@/types/table";
import { findGroupById } from "@/repositories/group.repository";
import { findAllRoles } from "@/repositories/role.repository";
import { SerializedRole, SerializedUser } from "@/types";
import { IRole } from "@/models/Role";

type ServiceResult = { success: true } | { success: false; message: string };

export async function getAllUsersService(): Promise<SerializedUser[]> {
  return findAllUsers();
}

export async function getUsersPaginatedService(
  state: TableState,
): Promise<PaginatedResult<SerializedUser>> {
  return findUsersPaginated(state);
}

export async function searchUsersService(
  query: string,
  excludeUserId: string,
): Promise<SerializedUser[]> {
  const users = query.trim() ? await searchUsers(query) : await findAllUsers();
  return users.filter((u) => u._id.toString() !== excludeUserId);
}

export async function addUserToGroupsService(
  userId: string,
  groupIds: string[],
): Promise<ServiceResult> {
  const user = await findUserById(userId);
  if (!user) return { success: false, message: "User không tồn tại" };

  for (const groupId of groupIds) {
    const group = await findGroupById(groupId);
    if (!group) return { success: false, message: "Group không tồn tại" };
  }

  await updateUserGroups(userId, groupIds);
  return { success: true };
}

export async function getAllRolesService(): Promise<SerializedRole[]> {
  return findAllRoles();
}

export async function updateUserRoleService(
  currentUserId: string,
  targetUserId: string,
  roleId: string,
): Promise<ServiceResult> {
  const [currentUser, targetUser] = await Promise.all([
    findUserById(currentUserId),
    findUserById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    return { success: false, message: "User không tồn tại" };
  }

  const currentRole = currentUser.role as IRole;
  const targetRole = targetUser.role as IRole;

  const currentHierarchy = currentRole.hierarchy ?? 99;
  const targetHierarchy = targetRole.hierarchy ?? 99;

  // Không được đổi role của user cùng cấp hoặc cao hơn
  if (targetHierarchy <= currentHierarchy) {
    return {
      success: false,
      message: "Bạn không có quyền thay đổi role của user này",
    };
  }

  // Role muốn assign phải thấp hơn cấp của mình
  const allRoles = await findAllRoles();
  const newRole = allRoles.find((r) => r._id.toString() === roleId);
  if (!newRole) {
    return { success: false, message: "Role không tồn tại" };
  }

  if (newRole.hierarchy <= currentHierarchy) {
    return {
      success: false,
      message: "Bạn không thể assign role cao hơn hoặc bằng cấp của mình",
    };
  }

  await updateUserRole(targetUserId, roleId);
  return { success: true };
}
