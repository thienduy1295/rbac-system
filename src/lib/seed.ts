import { connectDB } from "@/lib/db";
import { Role } from "@/models/Role";
import { User } from "@/models/User";
import { Permission } from "@/models/Permission";
import { Group } from "@/models/Group";
import { RefreshToken } from "@/models/RefreshToken";
import { PERMISSIONS } from "./permissions.constants";
import bcrypt from "bcryptjs";

export async function seedRoles() {
  await connectDB();

  // ── Xóa toàn bộ data cũ ──────────────────────────────
  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Permission.deleteMany({}),
    Group.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);
  console.log("🗑️  Cleared all data");

  // ── Roles ─────────────────────────────────────────────
  const roles = [
    { name: "super_admin", description: "Toàn quyền hệ thống", hierarchy: 1 },
    {
      name: "manager",
      description: "Quản lý group được phân công",
      hierarchy: 2,
    },
    { name: "user", description: "Người dùng thông thường", hierarchy: 99 },
  ];

  for (const role of roles) {
    await Role.create(role);
  }
  console.log("✅ Roles seeded");

  // ── Permissions ───────────────────────────────────────
  const permissions = [
    {
      name: PERMISSIONS.USERS_CREATE,
      description: "Tạo người dùng",
      resource: "users",
      action: "create",
    },
    {
      name: PERMISSIONS.USERS_READ,
      description: "Xem người dùng",
      resource: "users",
      action: "read",
    },
    {
      name: PERMISSIONS.USERS_UPDATE,
      description: "Sửa người dùng",
      resource: "users",
      action: "update",
    },
    {
      name: PERMISSIONS.USERS_DELETE,
      description: "Xóa người dùng",
      resource: "users",
      action: "delete",
    },
    {
      name: PERMISSIONS.GROUPS_CREATE,
      description: "Tạo group",
      resource: "groups",
      action: "create",
    },
    {
      name: PERMISSIONS.GROUPS_READ,
      description: "Xem group",
      resource: "groups",
      action: "read",
    },
    {
      name: PERMISSIONS.GROUPS_UPDATE,
      description: "Sửa group",
      resource: "groups",
      action: "update",
    },
    {
      name: PERMISSIONS.GROUPS_DELETE,
      description: "Xóa group",
      resource: "groups",
      action: "delete",
    },
    {
      name: PERMISSIONS.PERMISSIONS_READ,
      description: "Xem permissions",
      resource: "permissions",
      action: "read",
    },
  ];

  for (const permission of permissions) {
    await Permission.create(permission);
  }
  console.log("✅ Permissions seeded");

  // ── Super Admin user ──────────────────────────────────
  const superAdminRole = await Role.findOne({ name: "super_admin" });

  if (superAdminRole) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    await User.create({
      email: "admin@admin.com",
      password: hashed,
      name: "Super Admin",
      role: superAdminRole._id,
    });
    console.log("✅ Super admin seeded: admin@admin.com / Admin@123");
  }

  console.log("✅ Seed hoàn tất");
}
