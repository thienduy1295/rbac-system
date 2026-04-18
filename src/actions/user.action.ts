"use server";

import { revalidatePath } from "next/cache";
import {
  addUserToGroupSchema,
  AddUserToGroupInput,
  UpdateUserRoleInput,
  updateUserRoleSchema,
} from "@/schemas/user.schema";
import {
  addUserToGroupsService,
  getAllRolesService,
  searchUsersService,
  updateUserRoleService,
} from "@/services/user.service";
import { requireSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";
import { SerializedRole, SerializedUser } from "@/types";
import { serialize } from "@/lib/serialize";

type ActionResult = { success: true } | { success: false; message: string };

export async function addUserToGroupsAction(
  formData: AddUserToGroupInput,
): Promise<ActionResult> {
  const session = await requireSession();

  // Validate input trước
  const parsed = addUserToGroupSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // Kiểm tra permission
  const allowed = await hasPermission(session.userId, PERMISSIONS.GROUPS_UPDATE);
  if (!allowed) {
    return {
      success: false,
      message: "Bạn không có quyền thêm user vào group",
    };
  }

  const result = await addUserToGroupsService(
    parsed.data.userId,
    parsed.data.groupIds,
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/settings/users");
  return { success: true };
}

export async function searchUsersAction(
  query: string,
  excludeUserIds: string[] = [],
): Promise<SerializedUser[]> {
  const session = await requireSession();
  const results = await searchUsersService(query, session.userId);
  const filtered = results.filter((u) => !excludeUserIds.includes(u._id));
  return serialize(filtered);
}

export async function getAllRolesAction(): Promise<SerializedRole[]> {
  await requireSession();
  return serialize(await getAllRolesService());
}

export async function updateUserRoleAction(
  targetUserId: string,
  formData: UpdateUserRoleInput,
): Promise<ActionResult> {
  const session = await requireSession();

  // Validate input trước
  const parsed = updateUserRoleSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  // Kiểm tra permission
  const allowed = await hasPermission(session.userId, PERMISSIONS.USERS_UPDATE);
  if (!allowed) {
    return {
      success: false,
      message: "Bạn không có quyền thay đổi role của user",
    };
  }

  const result = await updateUserRoleService(
    session.userId,
    targetUserId,
    parsed.data.roleId,
  );

  if (!result.success) return result;

  revalidatePath("/settings/users");
  return { success: true };
}
