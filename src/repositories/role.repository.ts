import { connectDB } from "@/lib/db";
import { Role, IRole } from "@/models/Role";
import { SerializedRole } from "@/types";

export async function findRoleByName(name: string): Promise<IRole | null> {
  await connectDB();
  // Không dùng .lean() để giữ đúng type IRole (Document) — dùng nội bộ trong service
  return Role.findOne({ name });
}

export async function findAllRoles(): Promise<SerializedRole[]> {
  await connectDB();
  return Role.find()
    .sort({ hierarchy: 1 })
    .lean() as unknown as SerializedRole[];
}
