"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassWater } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { signUpAction } from "@/lib/actions/auth";

export default function SignUpPage() {
  const [role, setRole] = useState<"CREATOR" | "BARTENDER">("CREATOR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const result = await signUpAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-900">
            <GlassWater className="w-7 h-7 text-amber-500" />
            <span className="text-xl font-bold">HomeBarMenu</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-stone-900">Create your account</h1>
          <p className="mt-1 text-sm text-stone-500">Get started for free</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
            {(["CREATOR", "BARTENDER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-1.5 text-sm font-medium rounded-md transition-colors ${
                  role === r
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {r === "CREATOR" ? "Bar Creator" : "Bartender"}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400">
            {role === "CREATOR"
              ? "Create recipes, manage menus, and own a bar."
              : "Access recipes and instructions for a bar."}
          </p>

          <Field label="Full name" htmlFor="name" required>
            <Input id="name" name="name" placeholder="Jane Smith" required />
          </Field>

          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label="Password" htmlFor="password" required hint="At least 8 characters">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </Field>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-amber-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
