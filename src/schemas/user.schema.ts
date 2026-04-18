import { z } from "zod";

export const addUserToGroupSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn user"),
  groupIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 group"),
});

export const updateUserRoleSchema = z.object({
  roleId: z.string().min(1, "Vui lòng chọn role"),
});

export type AddUserToGroupInput = z.infer<typeof addUserToGroupSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
