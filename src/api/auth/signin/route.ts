import { NextRequest, NextResponse } from "next/server";
import { signInSchema } from "@/schemas/auth.schema";
import { signInService } from "@/services/auth.service"; // ← Cùng service

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const result = await signInService(parsed.data.email, parsed.data.password);

  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 401 });
  }

  const response = NextResponse.json({ user: result.user });
  response.cookies.set("access_token", result.accessToken, {
    httpOnly: true,
    maxAge: 60 * 15,
  });
  response.cookies.set("refresh_token", result.refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
