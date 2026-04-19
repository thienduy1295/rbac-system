import bcrypt from "bcryptjs";
import {
  findUserByIdWithPassword,
  updateUserName,
  updateUserPassword,
} from "@/repositories/user.repository";

type ServiceResult = { success: true } | { success: false; message: string };

export async function updateNameService(
  userId: string,
  name: string,
): Promise<ServiceResult> {
  const user = await findUserByIdWithPassword(userId);
  if (!user) return { success: false, message: "User không tồn tại" };

  await updateUserName(userId, name);
  return { success: true };
}

export async function changePasswordService(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ServiceResult> {
  const user = await findUserByIdWithPassword(userId);
  if (!user) return { success: false, message: "User không tồn tại" };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return { success: false, message: "Mật khẩu hiện tại không đúng" };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(userId, hashed);
  return { success: true };
}
