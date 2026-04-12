import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description: string;
  permissions: Types.ObjectId[]; // Ref đến Permission
  createdBy: Types.ObjectId; // Ref đến User (super admin tạo)
  parentGroup?: Types.ObjectId; // Hierarchy: group cha (nếu có)
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentGroup: { type: Schema.Types.ObjectId, ref: "Group" }, // Nullable
  },
  { timestamps: true },
);

export const Group =
  mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);
