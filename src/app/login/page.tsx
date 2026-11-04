"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Unable to sign in.");
      setLoading(false);
      return;
    }
    router.replace(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center py-12">
      <div className="w-full rounded border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="label-mono mb-3">COA LAB / ACCESS</p>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to continue</h1>
        <p className="mt-2 text-sm text-muted">Use your COA Lab account to access your chapters, practice sets and doubt solver.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-10 w-full rounded border border-line bg-paper px-3 text-sm" /></label>
          <label className="block text-sm font-medium">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-10 w-full rounded border border-line bg-paper px-3 text-sm" /></label>
          {error && <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          <button disabled={loading} className="h-10 w-full rounded bg-accent px-4 text-sm font-medium text-on-accent disabled:cursor-wait disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
        </form>
      </div>
    </div>
  );
}
