"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Login failed");

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50/50 px-4 py-8">
      <div className="w-full max-w-md">
        <form
          onSubmit={submit}
          className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          {/* Header Section */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl font-black tracking-tight text-[#173b73]">
              UPSC Bytes Admin
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to manage categories and visual Bytes.
            </p>
          </div>

          {/* Error Feedback */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100"
            >
              <div className="mt-0.5 font-semibold">Error:</div>
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@upscbytes.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#173b73] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173b73]/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-11 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#173b73] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173b73]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-[#173b73] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#173b73]/20 transition-all hover:bg-[#122e5b] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}