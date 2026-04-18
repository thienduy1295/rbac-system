import mongoose, { Schema, Document, Types } from "mongoose";
import { IRole } from "./Role";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: Types.ObjectId | IRole;
  groups: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true },
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
