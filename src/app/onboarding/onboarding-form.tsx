"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { createBarAction } from "@/lib/actions/bar";

export function OnboardingForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createBarAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4"
    >
      <Field label="Bar name" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          placeholder="The Rusty Nail"
          required
        />
      </Field>

      <Field label="Description" htmlFor="description" hint="Optional — shown on your public menu page">
        <Textarea
          id="description"
          name="description"
          placeholder="A cozy spot for hand-crafted cocktails…"
          rows={3}
        />
      </Field>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating bar…" : "Create my bar"}
      </Button>
    </form>
  );
}
