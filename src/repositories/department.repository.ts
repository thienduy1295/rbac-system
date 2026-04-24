import { connectDB } from "@/lib/db";
import { Department, IDepartment } from "@/models/Department";
import { SerializedDepartment } from "@/types";
import { Types } from "mongoose";

export async function findAllDepartment(): Promise<SerializedDepartment[]> {
  await connectDB();
  return Department.find()
    .populate("parentDepartment", "_id name")
    .populate("manager", "_id name email")
    .populate("linkedGroup", "_id name")
    .populate("createdBy", "_id name email")
    .lean() as unknown as SerializedDepartment[];
}

export async function findDepartmentById(
  id: string,
): Promise<IDepartment | null> {
  await connectDB();
  return Department.findById(id);
}

export async function findDepartmentByName(
  name: string,
): Promise<IDepartment | null> {
  await connectDB();
  return Department.findOne({ name });
}

export async function createDepartment(data: {
  name: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  linkedGroupId?: string;
  createdBy: string;
}): Promise<IDepartment> {
  await connectDB();
  return Department.create({
    name: data.name,
    description: data.description,
    parentDepartment: data.parentDepartmentId
      ? new Types.ObjectId(data.parentDepartmentId)
      : undefined,
    manager: data.managerId ? new Types.ObjectId(data.managerId) : undefined,
    linkedGroup: data.linkedGroupId
      ? new Types.ObjectId(data.linkedGroupId)
      : undefined,
    createdBy: new Types.ObjectId(data.createdBy),
  });
}

export async function updateDepartment(
  id: string,
  data: {
    name: string;
    description?: string;
    parentDepartmentId?: string;
    managerId?: string;
    linkedGroupId?: string;
    updatedBy: string;
  },
): Promise<IDepartment | null> {
  await connectDB();
  return Department.findByIdAndUpdate(
    id,
    {
      name: data.name,
      description: data.description,
      parentDepartment: data.parentDepartmentId
        ? new Types.ObjectId(data.parentDepartmentId)
        : undefined,
      manager: data.managerId ? new Types.ObjectId(data.managerId) : undefined,
      linkedGroup: data.linkedGroupId
        ? new Types.ObjectId(data.linkedGroupId)
        : undefined,
      updatedBy: new Types.ObjectId(data.updatedBy),
    },
    { new: true },
  );
}

export async function deleteDepartmentById(id: string): Promise<void> {
  await connectDB();
  await Department.findByIdAndDelete(id);
}

export async function findDepartmentsByParentId(
  parentId: string,
): Promise<IDepartment[]> {
  await connectDB();
  return Department.find({ parentDepartment: new Types.ObjectId(parentId) });
}

export async function countDepartments(): Promise<number> {
  await connectDB();
  return Department.countDocuments();
}
