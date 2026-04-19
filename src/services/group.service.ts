import {
  createGroup,
  findGroupByName,
  findAllGroups,
  findGroupsPaginated,
  updateGroup,
  findGroupById,
  findGroupsByParentId,
  findAllDescendantIds,
  deleteGroupById,
} from "@/repositories/group.repository";
import { PaginatedResult, TableState } from "@/types/table";
import { findAllPermissions } from "@/repositories/permission.repository";
import {
  addUsersToGroup,
  findUsersByGroupId,
  removeUsersFromGroup,
} from "@/repositories/user.repository";
import { SerializedGroup, SerializedPermission, SerializedUser } from "@/types";

type GroupServiceResult =
  | { success: true }
  | { success: false; message: string };

export async function createGroupService(data: {
  name: string;
  description?: string;
  permissionIds: string[];
  userIds?: string[];
  createdBy: string;
  parentGroupId?: string;
}): Promise<GroupServiceResult> {
  const existing = await findGroupByName(data.name);
  if (existing) return { success: false, message: "Tên group đã tồn tại" };

  const group = await createGroup(data);

  if (data.userIds && data.userIds.length > 0) {
    await addUsersToGroup(data.userIds, group._id.toString());
  }

  return { success: true };
}

export async function editGroupService(
  id: string,
  data: {
    name: string;
    description?: string;
    permissionIds: string[];
    userIds?: string[];
  },
  updatedBy: string,
): Promise<GroupServiceResult> {
  const group = await findGroupById(id);
  if (!group) return { success: false, message: "Group không tồn tại" };

  const existing = await findGroupByName(data.name);
  if (existing && existing._id.toString() !== id) {
    return { success: false, message: "Tên group đã tồn tại" };
  }

  const updated = await updateGroup(id, { ...data, updatedBy });
  if (!updated) return { success: false, message: "Cập nhật thất bại" };

  // Sync users trong group
  if (data.userIds !== undefined) {
    const currentUsers = await findUsersByGroupId(id);
    const currentUserIds = currentUsers.map((u) => u._id.toString());
    const toAdd = data.userIds.filter((uid) => !currentUserIds.includes(uid));
    const toRemove = currentUserIds.filter(
      (uid) => !data.userIds!.includes(uid),
    );
    if (toAdd.length > 0) await addUsersToGroup(toAdd, id);
    if (toRemove.length > 0) await removeUsersFromGroup(toRemove, id);
  }

  // Cascade: bớt quyền group con nếu group cha bị bớt quyền
  await cascadePermissionsToChildren(id, data.permissionIds);

  return { success: true };
}

// Đệ quy cascade permissions xuống tất cả group con
async function cascadePermissionsToChildren(
  groupId: string,
  parentPermissionIds: string[],
): Promise<void> {
  const children = await findGroupsByParentId(groupId);
  if (children.length === 0) return;

  for (const child of children) {
    const childPermissionIds = child.permissions.map((p) => p.toString());
    // Chỉ giữ lại permissions con đang có VÀ nằm trong set của cha
    const filteredPermissions = childPermissionIds.filter((pid) =>
      parentPermissionIds.includes(pid),
    );

    const updatedBy = child.updatedBy?.toString() ?? child.createdBy.toString();

    await updateGroup(child._id.toString(), {
      name: child.name,
      description: child.description,
      permissionIds: filteredPermissions,
      updatedBy,
    });

    await cascadePermissionsToChildren(
      child._id.toString(),
      filteredPermissions,
    );
  }
}

export async function getAllGroupsService(): Promise<SerializedGroup[]> {
  return findAllGroups();
}

export async function getGroupsPaginatedService(
  state: TableState,
): Promise<PaginatedResult<SerializedGroup>> {
  return findGroupsPaginated(state);
}

export async function getAllPermissionsService(): Promise<
  SerializedPermission[]
> {
  return findAllPermissions();
}

export async function getGroupUsersService(
  groupId: string,
): Promise<SerializedUser[]> {
  return findUsersByGroupId(groupId);
}

export async function deleteGroupService(
  id: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const group = await findGroupById(id);
  if (!group) return { success: false, message: "Group không tồn tại" };

  // Lấy tất cả group con/cháu cần xóa
  const descendantIds = await findAllDescendantIds(id);
  const allIds = [id, ...descendantIds];

  // Xóa tất cả groups và remove users khỏi groups đó
  for (const groupId of allIds) {
    await removeUsersFromGroup([], groupId); // remove tất cả users
    await deleteGroupById(groupId);
  }

  return { success: true };
}
