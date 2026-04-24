import { connectDB } from "@/lib/db";
import { Group, IGroup } from "@/models/Group";
import { SerializedGroup } from "@/types";
import { PaginatedResult, TableState } from "@/types/table";
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

export async function findGroupsPaginated(
  state: TableState,
): Promise<PaginatedResult<SerializedGroup>> {
  await connectDB();

  const { page, pageSize, search, filters, sortKey, sortDir } = state;

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (filters.parentGroup === "root") {
    query.parentGroup = { $exists: false };
  } else if (filters.parentGroup) {
    query.parentGroup = new Types.ObjectId(filters.parentGroup);
  }

  const allowedSortFields = new Set(["name", "createdAt"]);
  const sortField =
    sortKey && allowedSortFields.has(sortKey) ? sortKey : "createdAt";
  const sortObj: Record<string, 1 | -1> = {
    [sortField]: sortDir === "desc" ? -1 : 1,
  };

  const [total, data] = await Promise.all([
    Group.countDocuments(query),
    Group.find(query)
      .populate("permissions")
      .populate("createdBy", "_id name email")
      .populate("updatedBy", "_id name email")
      .populate("parentGroup", "_id name")
      .sort(sortObj)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  return {
    data: data as unknown as SerializedGroup[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function deleteGroupById(id: string): Promise<void> {
  await connectDB();
  await Group.findByIdAndDelete(id);
}

export async function findAllDescendantIds(groupId: string): Promise<string[]> {
  await connectDB();

  const ids: string[] = [];
  const queue = [groupId];

  // BFS để lấy tất cả group con/cháu
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await Group.find(
      { parentGroup: currentId },
      { _id: 1 },
    ).lean();

    for (const child of children) {
      const childId = child._id.toString();
      ids.push(childId);
      queue.push(childId);
    }
  }

  return ids;
}

export async function countGroups(): Promise<number> {
  await connectDB();
  return Group.countDocuments();
}
