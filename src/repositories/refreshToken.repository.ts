import { connectDB } from "@/lib/db";
import { RefreshToken } from "@/models/RefreshToken";

export async function createRefreshToken(userId: string, token: string) {
  await connectDB();
  return RefreshToken.create({
    token,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function findValidRefreshToken(token: string) {
  await connectDB();
  return RefreshToken.findOne({ token, isRevoked: false });
}

export async function revokeRefreshToken(token: string) {
  await connectDB();
  return RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
}
