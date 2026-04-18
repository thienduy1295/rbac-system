"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema, SignUpInput, signUpSchema } from "@/schemas/auth.schema";
import {
  signInService,
  signOutService,
  signUpService,
} from "@/services/auth.service";

type SignInResult =
  | { success: true; user: { name: string; email: string; role: string } }
  | {
      success: false;
      message: string;
      field?: "email" | "password" | "general";
    };

type AuthResult =
  | { success: true; user: { name: string; email: string; role: string } }
  | {
      success: false;
      message: string;
      field?: "name" | "email" | "password" | "confirmPassword" | "general";
    };

// ── Helper set cookie (dùng chung cho signIn và signUp) ───────────────────
async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

// ── Sign In ───────────────────────────────────────────────
export async function signInAction(formData: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const result = await signInService(parsed.data.email, parsed.data.password);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  await setAuthCookies(result.accessToken, result.refreshToken);
  return { success: true, user: result.user };
}

// ── Sign Up ───────────────────────────────────────────────
export async function signUpAction(formData: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message,
      field: "general",
    };
  }

  const result = await signUpService(
    parsed.data.name,
    parsed.data.email,
    parsed.data.password,
  );

  if (!result.success) {
    return { success: false, message: result.message, field: "email" };
  }

  await setAuthCookies(result.accessToken, result.refreshToken);
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
