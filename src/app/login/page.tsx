"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-md rounded-xl border border-farm-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center">
          <Logo className="h-10 w-10 text-farm-500" />
          <h1 className="mt-3 text-xl font-bold text-farm-700">
            Sign in to FarmFolio
          </h1>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-farm-500 px-4 py-2.5 font-medium text-white hover:bg-farm-600 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-farm-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="my-5 flex items-center gap-3 text-xs text-neutral-400">
          <span className="h-px flex-1 bg-neutral-200" />
          OR
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* TODO: hook up Google OAuth */}
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 py-2.5 text-sm text-neutral-500"
        >
          <GoogleIcon /> Continue with Google (coming soon)
        </button>

        <p className="mt-6 rounded-md bg-farm-50 p-3 text-center text-xs text-farm-700">
          Demo login: <strong>demo@farmfolio.app</strong> / <strong>password123</strong>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  ...rest
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type">) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        {...rest}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-farm-500 focus:ring-2 focus:ring-farm-200"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.3 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.2z" />
      <path fill="#FBBC05" d="M10.4 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.1a24 24 0 0 0 0 21.4l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.2-8.6 2.2-6.4 0-11.7-3.8-13.6-9.4l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
