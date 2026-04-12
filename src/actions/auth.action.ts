"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema } from "@/schemas/auth.schema";
import { signInService, signOutService } from "@/services/auth.service";

// ── Sign In ───────────────────────────────────────────────
export async function signInAction(formData: {
  email: string;
  password: string;
}) {
  // Validate
  const parsed = signInSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const result = await signInService(parsed.data.email, parsed.data.password);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  // Set cookie
  const cookieStore = await cookies();

  cookieStore.set("access_token", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  cookieStore.set("refresh_token", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true, user: result.user };
}

// ── Sign Out ──────────────────────────────────────────────
export async function signOutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    await signOutService(refreshToken);
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  redirect("/signin");
}
