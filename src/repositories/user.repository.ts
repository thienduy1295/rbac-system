import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";
import { SerializedUser } from "@/types";
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
  await User.updateMany(
    { _id: { $in: userIds } },
    { $pull: { groups: new Types.ObjectId(groupId) } },
  );
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
