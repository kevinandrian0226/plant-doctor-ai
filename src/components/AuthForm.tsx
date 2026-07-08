"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Leaf, Mail, Lock, User, Loader2 } from "lucide-react";
import { login, loginWithGoogle, register, type AuthState } from "@/app/(auth)/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Memproses..." : label}
    </button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? login : register;
  const [state, formAction] = useFormState<AuthState, FormData>(action, {});
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [googlePending, startGoogle] = useTransition();
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogle = () => {
    setGoogleError(null);
    startGoogle(async () => {
      const res = await loginWithGoogle();
      if (res?.error) setGoogleError(res.error);
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30">
          <Leaf className="h-7 w-7" />
        </div>
        <h1 className="display-title text-3xl">
          {mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "login"
            ? "Masuk untuk melanjutkan merawat koleksi tanamanmu."
            : "Mulai diagnosa tanaman premium-mu dengan AI."}
        </p>
      </div>

      <div className="card">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />

          {mode === "register" && (
            <div>
              <label className="label" htmlFor="name">
                Nama
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Nama kamu"
                  className="input pl-10"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="kamu@email.com"
                className="input pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input pl-10"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="rounded-lg bg-leaf-50 px-3 py-2 text-sm text-leaf-700 dark:bg-leaf-900/20 dark:text-leaf-300">
              {state.message}
            </p>
          )}

          <SubmitButton label={mode === "login" ? "Masuk" : "Daftar"} />
        </form>

        {/* Google login — pastikan Google provider aktif di Supabase (Authentication > Providers). */}
        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          atau
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googlePending}
          className="btn-secondary w-full"
        >
          {googlePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          {googlePending ? "Mengalihkan..." : "Lanjut dengan Google"}
        </button>
        {googleError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
            {googleError}
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {mode === "login" ? (
          <>
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-leaf-600 hover:underline">
              Daftar
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-leaf-600 hover:underline">
              Masuk
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
