import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "@/repositories/user.repository";
import { IRole } from "@/models/Role";
import {
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
} from "@/repositories/refreshToken.repository";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { findRoleByName } from "@/repositories/role.repository";

// ── Kiểu trả về ───────────────────────────────────────────
type AuthResult =
  | {
      success: true;
      accessToken: string;
      refreshToken: string;
      user: { name: string; email: string; role: string };
    }
  | { success: false; message: string };

type RefreshResult =
  | { success: true; accessToken: string }
  | { success: false; message: string };

// ── Sign In ───────────────────────────────────────────────
export async function signInService(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await findUserByEmail(email);

  if (!user) {
    return { success: false, message: "Email hoặc mật khẩu không đúng" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, message: "Email hoặc mật khẩu không đúng" };
  }

  const role = (user.role as IRole).name;
  const payload = { userId: user._id.toString(), email: user.email, role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createRefreshToken(user._id.toString(), refreshToken);

  return {
    success: true,
    accessToken,
    refreshToken,
    user: { name: user.name, email: user.email, role },
  };
}

// ── Sign Up ───────────────────────────────────────────────
export async function signUpService(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  // Kiểm tra email đã tồn tại chưa
  const existing = await findUserByEmail(email);
  if (existing) {
    return { success: false, message: "Email này đã được sử dụng" };
  }

  // Lấy role mặc định là "user"
  const role = await findRoleByName("user");
  if (!role) {
    return {
      success: false,
      message: "Hệ thống chưa được khởi tạo, vui lòng liên hệ admin",
    };
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Tạo user
  const user = await createUser({
    name,
    email,
    password: hashed,
    roleId: role._id,
  });

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: role.name,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createRefreshToken(user._id.toString(), refreshToken);

  return {
    success: true,
    accessToken,
    refreshToken,
    user: { name: user.name, email: user.email, role: role.name },
  };
}

// ── Refresh Token ─────────────────────────────────────────
export async function refreshTokenService(
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await findValidRefreshToken(refreshToken);

    if (!stored) {
      return { success: false, message: "Refresh token không hợp lệ" };
    }

    const newAccessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { success: true, accessToken: newAccessToken };
  } catch {
    return { success: false, message: "Refresh token hết hạn" };
  }
}

// ── Sign Out ──────────────────────────────────────────────
export async function signOutService(refreshToken: string): Promise<void> {
  await revokeRefreshToken(refreshToken);
}
