"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setBusy(true);
    try {
      await register({ name, email, password, confirmPassword });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
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
            Welcome to FarmFolio
          </h1>
          <p className="text-sm text-neutral-500">Create your account</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Name (optional)" type="text" value={name} onChange={setName} autoComplete="name" />
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
          />
          <Field
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
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
            {busy ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-farm-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
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
