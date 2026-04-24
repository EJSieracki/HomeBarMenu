"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { createRecipeAction } from "@/lib/actions/recipe";
import { GlassWater, BookOpen, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassicCocktail } from "@prisma/client";

const GLASS_TYPES = [
  "COUPE", "MARTINI", "ROCKS", "HIGHBALL", "COLLINS",
  "SHOT", "FLUTE", "WINE", "PINT", "MUG", "TIKI", "OTHER",
];

type StartMode = "scratch" | "classic" | "clone";

interface Props {
  classics: ClassicCocktail[];
  barRecipes: { id: string; name: string }[];
}

export function NewRecipeForm({ classics, barRecipes }: Props) {
  const [mode, setMode] = useState<StartMode>("scratch");
  const [selectedClassic, setSelectedClassic] = useState<ClassicCocktail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const modes: { id: StartMode; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "scratch", label: "From scratch", icon: GlassWater, desc: "Build a brand-new recipe." },
    { id: "classic", label: "Classic base", icon: BookOpen, desc: "Start from a classic cocktail." },
    { id: "clone", label: "Clone recipe", icon: Copy, desc: "Copy one of your existing recipes." },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    if (mode === "classic" && selectedClassic) {
      formData.set("baseClassicId", selectedClassic.id);
    }

    const result = await createRecipeAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-colors",
                mode === m.id
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{m.label}</span>
              <span className="text-xs text-stone-400">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Classic selector */}
      {mode === "classic" && (
        <Field label="Select a classic cocktail" required>
          <Select
            name="baseClassicId"
            onChange={(e) => {
              const c = classics.find((c) => c.id === e.target.value);
              setSelectedClassic(c ?? null);
            }}
          >
            <option value="">Choose a classic…</option>
            {classics.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          {selectedClassic?.description && (
            <p className="text-xs text-stone-500 mt-1">{selectedClassic.description}</p>
          )}
        </Field>
      )}

      {/* Clone selector */}
      {mode === "clone" && (
        <Field label="Select a recipe to clone" required>
          <Select name="clonedFromRecipeId">
            <option value="">Choose a recipe…</option>
            {barRecipes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
        </Field>
      )}

      {/* Recipe details */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h3 className="font-semibold text-stone-900">Recipe details</h3>

        <Field label="Recipe name" htmlFor="name" required>
          <Input
            id="name"
            name="name"
            placeholder={selectedClassic ? selectedClassic.name : "e.g. Smoked Negroni"}
            required
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            placeholder="A brief description of this cocktail…"
            rows={2}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Glass type" htmlFor="glassType" required>
            <Select
              id="glassType"
              name="glassType"
              defaultValue={selectedClassic?.glassType ?? "ROCKS"}
            >
              {GLASS_TYPES.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Garnish" htmlFor="garnish">
            <Input id="garnish" name="garnish" placeholder="e.g. Orange twist" />
          </Field>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create recipe"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
