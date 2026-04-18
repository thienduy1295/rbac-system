import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, "Tên group phải có ít nhất 2 ký tự")
    .max(50, "Tên group không được quá 50 ký tự"),
  description: z.string().max(200, "Mô tả không được quá 200 ký tự").optional(),
  permissionIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 permission"),
  userIds: z.array(z.string()),
  parentGroupId: z.string().optional(), // ← thêm
});

export const editGroupSchema = z.object({
  name: z
    .string()
    .min(2, "Tên group phải có ít nhất 2 ký tự")
    .max(50, "Tên group không được quá 50 ký tự"),
  description: z.string().max(200, "Mô tả không được quá 200 ký tự").optional(),
  permissionIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 permission"),
  userIds: z.array(z.string()), // ← bỏ optional và default
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type EditGroupInput = z.infer<typeof editGroupSchema>;
