import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Tự xóa document khi hết hạn (MongoDB TTL Index)
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
