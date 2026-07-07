"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

// Login email/password
export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirect") || "/dashboard");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau password salah. Coba lagi." };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// Registrasi email/password
export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    return { error: error.message };
  }

  // Jika email confirmation aktif, session belum ada.
  if (!data.session) {
    return {
      message:
        "Registrasi berhasil! Cek email kamu untuk verifikasi, lalu login.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// Update nama tampilan user
export async function updateProfileName(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { message: "Profil tersimpan." };
}

// Logout
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// Placeholder Google OAuth — siap diaktifkan setelah provider diatur di Supabase.
export async function loginWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
  return {};
}
