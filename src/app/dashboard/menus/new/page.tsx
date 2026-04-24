"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { createMenuAction } from "@/lib/actions/menu";
import { useRouter } from "next/navigation";

export default function NewMenuPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createMenuAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">New menu</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Create a menu and assign recipes to it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <Field label="Menu name" htmlFor="name" required>
          <Input id="name" name="name" placeholder="e.g. Weekend Brunch Menu" required />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" placeholder="Describe this menu…" rows={2} />
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isPublic"
            className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-stone-700">Make this menu public (visible to patrons)</span>
        </label>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create menu"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
