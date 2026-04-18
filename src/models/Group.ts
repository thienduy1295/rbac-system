import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  parentGroup?: Types.ObjectId;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    parentGroup: { type: Schema.Types.ObjectId, ref: "Group" },
  },
  { timestamps: true },
);

// KHÔNG delete mongoose.models["Group"] — gây lỗi "Cannot overwrite model" trên hot reload
export const Group =
  mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);
