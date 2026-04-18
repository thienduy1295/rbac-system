import { connectDB } from "@/lib/db";
import { Group, IGroup } from "@/models/Group";
import { SerializedGroup } from "@/types";
import { Types } from "mongoose";

// Import để Mongoose register models trước khi populate
import "@/models/User";
import "@/models/Permission";

// ── Internal (trả về IGroup, dùng nội bộ trong service) ───────────────────

export async function findGroupByName(name: string): Promise<IGroup | null> {
  await connectDB();
  return Group.findOne({ name });
}

export async function findGroupById(id: string): Promise<IGroup | null> {
  await connectDB();
  return Group.findById(id);
}

export async function findGroupsByParentId(
  parentId: string,
): Promise<IGroup[]> {
  await connectDB();
  return Group.find({ parentGroup: new Types.ObjectId(parentId) });
}

export async function createGroup(data: {
  name: string;
  description?: string;
  permissionIds: string[];
  createdBy: string;
  parentGroupId?: string;
}): Promise<IGroup> {
  await connectDB();
  return Group.create({
    name: data.name,
    description: data.description,
    permissions: data.permissionIds.map((id) => new Types.ObjectId(id)),
    createdBy: new Types.ObjectId(data.createdBy),
    parentGroup: data.parentGroupId
      ? new Types.ObjectId(data.parentGroupId)
      : undefined,
  });
}

export async function updateGroup(
  id: string,
  data: {
    name: string;
    description?: string;
    permissionIds: string[];
    updatedBy: string;
  },
): Promise<IGroup | null> {
  await connectDB();
  return Group.findByIdAndUpdate(
    id,
    {
      name: data.name,
      description: data.description,
      permissions: data.permissionIds.map((pid) => new Types.ObjectId(pid)),
      updatedBy: new Types.ObjectId(data.updatedBy),
    },
    { new: true },
  );
}

// ── Serialized (trả về SerializedGroup[], dùng cho service → action → component) ──

export async function findAllGroups(): Promise<SerializedGroup[]> {
  await connectDB();
  return Group.find()
    .populate("permissions")
    .populate("createdBy", "_id name email")
    .populate("updatedBy", "_id name email")
    .populate("parentGroup", "_id name")
    .lean() as unknown as SerializedGroup[];
}
