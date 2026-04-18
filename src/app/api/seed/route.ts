import { seedRoles } from "@/lib/seed";
import { NextResponse } from "next/server";

export async function GET() {
  // Chỉ chạy được ở môi trường dev
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Không cho phép" }, { status: 403 });
  }
  await seedRoles();
  return NextResponse.json({ message: "Seeded!" });
}
