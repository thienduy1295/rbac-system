import mongoose, { Document, Schema } from "mongoose";

export interface IPermission extends Document {
  name: string;
  description: string;
  resource: string;
  action: string;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    resource: { type: String, required: true },
    action: { type: String, required: true },
  },
  { timestamps: true },
);

export const Permission =
  mongoose.models.Permission ||
  mongoose.model<IPermission>("Permission", PermissionSchema);
