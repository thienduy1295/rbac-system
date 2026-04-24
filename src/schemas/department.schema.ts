import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Tên phòng ban phải có ít nhất 2 ký tự").max(100),
  description: z.string().max(200).optional(),
  parentDepartmentId: z.string().optional(),
  managerId: z.string().optional(),
  linkedGroupId: z.string().optional(),
});

export const editDepartmentSchema = createDepartmentSchema;

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type EditDepartmentInput = z.infer<typeof editDepartmentSchema>;
