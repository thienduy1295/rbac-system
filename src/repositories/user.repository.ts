import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  return User.findOne({ email }).select("+password").populate("role");
}

export async function findUserById(id: string): Promise<IUser | null> {
  await connectDB();
  return User.findById(id).populate("role");
}
