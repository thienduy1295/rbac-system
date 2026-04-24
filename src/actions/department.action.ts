"use server";

import { revalidatePath } from "next/cache";
import {
  createDepartmentSchema,
  editDepartmentSchema,
  CreateDepartmentInput,
  EditDepartmentInput,
} from "@/schemas/department.schema";
import {
  createDepartmentService,
  editDepartmentService,
  deleteDepartmentService,
} from "@/services/department.service";
import { requireSession } from "@/lib/auth";
import { checkPermission, getUserContext } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions.constants";

type DepartmentActionResult =
  | { success: true }
  | { success: false; message: string; field?: "name" | "general" };

export async function createDepartmentAction(
  formData: CreateDepartmentInput,
): Promise<DepartmentActionResult> {
  const session = await requireSession();
  const { permissionNames: permissions, isSuperAdmin } = await getUserContext(
    session.userId,
  );

  if (
    !checkPermission(permissions, PERMISSIONS.DEPARTMENTS_CREATE, isSuperAdmin)
  ) {
    return {
      success: false,
      message: "Bạn không có quyền tạo phòng ban",
      field: "general",
    };
  }

  const parsed = createDepartmentSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message,
      field: "general",
    };
  }

  const result = await createDepartmentService({
    ...parsed.data,
    createdBy: session.userId,
  });

  if (!result.success) {
    return { success: false, message: result.message, field: "name" };
  }

  revalidatePath("/departments");
  return { success: true };
}

export async function editDepartmentAction(
  id: string,
  formData: EditDepartmentInput,
): Promise<DepartmentActionResult> {
  const session = await requireSession();
  const { permissionNames: permissions, isSuperAdmin } = await getUserContext(
    session.userId,
  );

  if (
    !checkPermission(permissions, PERMISSIONS.DEPARTMENTS_UPDATE, isSuperAdmin)
  ) {
    return {
      success: false,
      message: "Bạn không có quyền sửa phòng ban",
      field: "general",
    };
  }

  const parsed = editDepartmentSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message,
      field: "general",
    };
  }

  const result = await editDepartmentService(id, parsed.data, session.userId);

  if (!result.success) {
    return { success: false, message: result.message, field: "name" };
  }

  revalidatePath("/departments");
  return { success: true };
}

export async function deleteDepartmentAction(
  id: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const session = await requireSession();
  const { permissionNames: permissions, isSuperAdmin } = await getUserContext(
    session.userId,
  );

  if (
    !checkPermission(permissions, PERMISSIONS.DEPARTMENTS_DELETE, isSuperAdmin)
  ) {
    return { success: false, message: "Bạn không có quyền xóa phòng ban" };
  }

  const result = await deleteDepartmentService(id);
  if (!result.success) return result;

  revalidatePath("/departments");
  return { success: true };
}
