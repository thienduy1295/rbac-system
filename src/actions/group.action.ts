"use server";

import { revalidatePath } from "next/cache";
import {
  createGroupSchema,
  editGroupSchema,
  CreateGroupInput,
  EditGroupInput,
} from "@/schemas/group.schema";
import {
  createGroupService,
  editGroupService,
  getGroupUsersService,
} from "@/services/group.service";
import { requireSession } from "@/lib/auth";
import { SerializedUser } from "@/types";
import { serialize } from "@/lib/serialize";
import {
  canAssignPermissions,
  canModifyGroup,
  hasPermission,
} from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";

type GroupActionResult =
  | { success: true }
  | {
      success: false;
      message: string;
      field?: "name" | "permissionIds" | "general";
    };

export async function createGroupAction(
  formData: CreateGroupInput,
): Promise<GroupActionResult> {
  const session = await requireSession();

  // 1. Validate input trước
  const parsed = createGroupSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message,
      field: "general",
    };
  }

  // 2. Kiểm tra permission tạo group
  const allowed = await hasPermission(
    session.userId,
    PERMISSIONS.GROUPS_CREATE,
  );
  if (!allowed) {
    return {
      success: false,
      message: "Bạn không có quyền tạo group",
      field: "general",
    };
  }

  // 3. Kiểm tra không tự cấp quyền cao hơn mình đang có
  const canAssign = await canAssignPermissions(
    session.userId,
    parsed.data.permissionIds,
  );
  if (!canAssign) {
    return {
      success: false,
      message: "Bạn chỉ có thể phân quyền trong phạm vi quyền của mình",
      field: "permissionIds",
    };
  }

  const result = await createGroupService({
    ...parsed.data,
    createdBy: session.userId,
  });

  if (!result.success) {
    return { success: false, message: result.message, field: "name" };
  }

  revalidatePath("/settings/groups");
  revalidatePath("/settings/users");
  return { success: true };
}

export async function editGroupAction(
  id: string,
  formData: EditGroupInput,
): Promise<GroupActionResult> {
  const session = await requireSession();

  // 1. Validate input trước
  const parsed = editGroupSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message,
      field: "general",
    };
  }

  // 2. Kiểm tra user có thể sửa group này không (không sửa group mình đang thuộc)
  const allowed = await canModifyGroup(session.userId, id);
  if (!allowed) {
    return {
      success: false,
      message: "Bạn không được chỉnh sửa group mà bạn đang là thành viên",
      field: "general",
    };
  }

  // 3. Kiểm tra không tự cấp quyền cao hơn mình đang có
  const canAssign = await canAssignPermissions(
    session.userId,
    parsed.data.permissionIds,
  );
  if (!canAssign) {
    return {
      success: false,
      message: "Bạn chỉ có thể phân quyền trong phạm vi quyền của mình",
      field: "permissionIds",
    };
  }

  const result = await editGroupService(id, parsed.data, session.userId);

  if (!result.success) {
    return { success: false, message: result.message, field: "name" };
  }

  revalidatePath("/settings/groups");
  revalidatePath("/settings/users");
  return { success: true };
}

export async function getGroupUsersAction(
  groupId: string,
): Promise<SerializedUser[]> {
  await requireSession();
  const users = await getGroupUsersService(groupId);
  return serialize(users);
}
