import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string; // vd: "super_admin", "manager", "user"
  description: string;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
  },
  { timestamps: true },
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
