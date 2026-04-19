import { cookies } from "next/headers";
import {
  verifyAccessToken,
  JWTPayload,
  verifyRefreshToken,
  signAccessToken,
} from "@/lib/jwt";
import { connectDB } from "./db";
import { RefreshToken } from "@/models/RefreshToken";

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function rotateAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await connectDB();

    const stored = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false,
    });

    if (!stored) return null;

    return signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  } catch {
    return null;
  }
}
