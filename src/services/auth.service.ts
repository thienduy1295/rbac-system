import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/repositories/user.repository";
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
