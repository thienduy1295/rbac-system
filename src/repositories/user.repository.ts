import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";
import { SerializedUser } from "@/types";
import { PaginatedResult, TableState } from "@/types/table";
import { Types } from "mongoose";

// Import để Mongoose register models trước khi populate
import "@/models/Role";
import "@/models/Group";

// ── Internal (trả về IUser, dùng nội bộ trong service) ────────────────────

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  return User.findOne({ email }).select("+password").populate("role");
}

export async function findUserById(id: string): Promise<IUser | null> {
  await connectDB();
  return User.findById(id).populate("role");
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: Types.ObjectId;
}): Promise<IUser> {
  await connectDB();
  return User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.roleId,
  });
}

export async function updateUserGroups(
  userId: string,
  groupIds: string[],
): Promise<IUser | null> {
  await connectDB();
  return User.findByIdAndUpdate(
    userId,
    { groups: groupIds.map((id) => new Types.ObjectId(id)) },
    { new: true },
  );
}

export async function updateUserRole(
  userId: string,
  roleId: string,
): Promise<IUser | null> {
  await connectDB();
  return User.findByIdAndUpdate(
    userId,
    { role: new Types.ObjectId(roleId) },
    { new: true },
  );
}

export async function addUsersToGroup(
  userIds: string[],
  groupId: string,
): Promise<void> {
  await connectDB();
  await User.updateMany(
    { _id: { $in: userIds } },
    { $addToSet: { groups: new Types.ObjectId(groupId) } },
  );
}

export async function removeUsersFromGroup(
  userIds: string[],
  groupId: string,
): Promise<void> {
  await connectDB();

  const filter =
    userIds.length > 0 ? { _id: { $in: userIds } } : { groups: groupId };

  await User.updateMany(filter, {
    $pull: { groups: new Types.ObjectId(groupId) },
  });
}

// ── Serialized (trả về SerializedUser[], dùng cho service → action → component) ──

export async function findAllUsers(): Promise<SerializedUser[]> {
  await connectDB();
  // groups chỉ cần _id + name (SerializedGroupRef)
  return User.find()
    .populate("role")
    .populate("groups", "_id name")
    .lean() as unknown as SerializedUser[];
}

export async function searchUsers(query: string): Promise<SerializedUser[]> {
  await connectDB();
  return User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  })
    .populate("role")
    .populate("groups", "_id name")
    .lean() as unknown as SerializedUser[];
}

export async function findUsersByGroupId(
  groupId: string,
): Promise<SerializedUser[]> {
  await connectDB();
  return User.find({ groups: groupId })
    .populate("role")
    .populate("groups", "_id name")
    .lean() as unknown as SerializedUser[];
}

export async function updateUserName(
  userId: string,
  name: string,
): Promise<IUser | null> {
  await connectDB();
  return User.findByIdAndUpdate(userId, { name }, { new: true });
}

export async function updateUserPassword(
  userId: string,
  hashedPassword: string,
): Promise<IUser | null> {
  await connectDB();
  return User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true },
  );
}

export async function findUserByIdWithPassword(
  id: string,
): Promise<IUser | null> {
  await connectDB();
  return User.findById(id).select("+password");
}

export async function countUsers(): Promise<number> {
  await connectDB();
  return User.countDocuments();
}

export async function findUsersPaginated(
  state: TableState,
): Promise<PaginatedResult<SerializedUser>> {
  await connectDB();

  const { page, pageSize, search, filters, sortKey, sortDir } = state;

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (filters.role) {
    query.role = new Types.ObjectId(filters.role);
  }

  const allowedSortFields = new Set(["name", "email", "createdAt"]);
  const sortField = sortKey && allowedSortFields.has(sortKey) ? sortKey : "createdAt";
  const sortObj: Record<string, 1 | -1> = {
    [sortField]: sortDir === "desc" ? -1 : 1,
  };

  const [total, data] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .populate("role")
      .populate("groups", "_id name")
      .sort(sortObj)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  return {
    data: data as unknown as SerializedUser[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
