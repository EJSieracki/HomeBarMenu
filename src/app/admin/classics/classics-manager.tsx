"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClassicAction, deleteClassicAction } from "@/lib/actions/admin";
import { Plus, Trash2 } from "lucide-react";
import { formatGlassType } from "@/lib/utils";
import type { ClassicCocktail } from "@prisma/client";

const GLASS_TYPES = [
  "COUPE", "MARTINI", "ROCKS", "HIGHBALL", "COLLINS",
  "SHOT", "FLUTE", "WINE", "PINT", "MUG", "TIKI", "OTHER",
];

interface Props {
  classics: ClassicCocktail[];
}

export function AdminClassicsManager({ classics: initial }: Props) {
  const [classics, setClassics] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createClassicAction(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.classic) {
      setClassics((prev) => [...prev, result.classic as ClassicCocktail].sort((a, b) => a.name.localeCompare(b.name)));
      (e.target as HTMLFormElement).reset();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this classic cocktail?")) return;
    const result = await deleteClassicAction(id);
    if (!result?.error) {
      setClassics((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-stone-900">Add classic cocktail</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" required>
                <Input name="name" placeholder="e.g. Negroni" required />
              </Field>
              <Field label="Glass type">
                <Select name="glassType" defaultValue="ROCKS">
                  {GLASS_TYPES.map((g) => (
                    <option key={g} value={g}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <Textarea name="description" placeholder="Brief description…" rows={2} />
            </Field>
            <Field label="Garnish">
              <Input name="garnish" placeholder="e.g. Orange peel" />
            </Field>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" size="sm" disabled={saving}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">Classic cocktails</h3>
            <Badge>{classics.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {classics.map((c) => (
              <div
                key={c.id}
                className="flex items-start justify-between py-2 px-2 rounded-lg hover:bg-stone-50 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-800">{c.name}</span>
                    <Badge variant="info">{formatGlassType(c.glassType)}</Badge>
                    {c.garnish && <span className="text-xs text-stone-400">{c.garnish}</span>}
                  </div>
                  {c.description && (
                    <p className="text-xs text-stone-400 mt-0.5">{c.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-colors ml-4 mt-0.5 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
