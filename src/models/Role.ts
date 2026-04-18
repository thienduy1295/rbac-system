import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string; // vd: "super_admin", "manager", "user"
  description?: string;
  hierarchy: number;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    hierarchy: { type: Number, required: true, default: 99 },
  },
  { timestamps: true },
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
