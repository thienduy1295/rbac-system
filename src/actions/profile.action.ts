"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  updateNameSchema,
  UpdateNameInput,
  changePasswordSchema,
  ChangePasswordInput,
} from "@/schemas/profile.schema";
import {
  updateNameService,
  changePasswordService,
} from "@/services/profile.service";

type ActionResult = { success: true } | { success: false; message: string };

export async function updateNameAction(
  formData: UpdateNameInput,
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = updateNameSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const result = await updateNameService(session.userId, parsed.data.name);
  if (!result.success) return result;

  revalidatePath("/profile");
  return { success: true };
}

export async function changePasswordAction(
  formData: ChangePasswordInput,
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = changePasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const result = await changePasswordService(
    session.userId,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );

  if (!result.success) return result;

  return { success: true };
}
