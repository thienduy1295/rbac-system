import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  parentDepartment?: Types.ObjectId;
  manager?: Types.ObjectId;
  linkedGroup?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    parentDepartment: { type: Schema.Types.ObjectId, ref: "Department" },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    linkedGroup: { type: Schema.Types.ObjectId, ref: "Group" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Department;
}

export const Department =
  (mongoose.models.Department as mongoose.Model<IDepartment>) ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);
