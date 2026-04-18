import { connectDB } from "@/lib/db";
import { Permission } from "@/models/Permission";
import { SerializedPermission } from "@/types";

export async function findAllPermissions(): Promise<SerializedPermission[]> {
  await connectDB();
  return Permission.find().lean() as unknown as SerializedPermission[];
}
