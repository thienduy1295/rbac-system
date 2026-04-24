import { IDepartment } from "@/models/Department";
import {
  createDepartment,
  deleteDepartmentById,
  findAllDepartment,
  findDepartmentById,
  findDepartmentByName,
  findDepartmentsByParentId,
  updateDepartment,
} from "@/repositories/department.repository";
import { SerializedDepartment } from "@/types";

type DepartmentResult =
  | { success: true; department: IDepartment }
  | { success: false; message: string };

export async function getAllDepartmentsService(): Promise<
  SerializedDepartment[]
> {
  return findAllDepartment();
}

export async function createDepartmentService(data: {
  name: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  linkedGroupId?: string;
  createdBy: string;
}): Promise<DepartmentResult> {
  const existing = await findDepartmentByName(data.name);
  if (existing) {
    return { success: false, message: "Tên phòng ban đã tồn tại" };
  }

  const department = await createDepartment(data);
  return { success: true, department };
}

export async function editDepartmentService(
  id: string,
  data: {
    name: string;
    description?: string;
    parentDepartmentId?: string;
    managerId?: string;
    linkedGroupId?: string;
  },
  updatedBy: string,
): Promise<DepartmentResult> {
  const department = await findDepartmentById(id);
  if (!department) {
    return { success: false, message: "Phòng ban không tồn tại" };
  }

  const existing = await findDepartmentByName(data.name);
  if (existing && existing._id.toString() !== id) {
    return { success: false, message: "Tên phòng ban đã tồn tại" };
  }

  if (data.parentDepartmentId === id) {
    return {
      success: false,
      message: "Phòng ban không thể là cha của chính nó",
    };
  }

  const updated = await updateDepartment(id, { ...data, updatedBy });
  if (!updated) return { success: false, message: "Cập nhật thất bại" };

  return { success: true, department: updated };
}

export async function deleteDepartmentService(
  id: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const department = await findDepartmentById(id);
  if (!department)
    return { success: false, message: "Phòng ban không tồn tại" };

  const descendants = await getAllDescendantDepartmentIds(id);
  const allIds = [id, ...descendants];

  for (const deptId of allIds) {
    await deleteDepartmentById(deptId);
  }

  return { success: true };
}

async function getAllDescendantDepartmentIds(id: string): Promise<string[]> {
  const ids: string[] = [];
  const queue = [id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await findDepartmentsByParentId(currentId);
    for (const child of children) {
      const childId = child._id.toString();
      ids.push(childId);
      queue.push(childId);
    }
  }

  return ids;
}
