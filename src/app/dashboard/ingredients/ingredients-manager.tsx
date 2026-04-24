"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createIngredientAction, deleteIngredientAction } from "@/lib/actions/ingredient";
import { Plus, Trash2 } from "lucide-react";
import type { Ingredient } from "@prisma/client";

const CATEGORIES = [
  "SPIRIT", "MIXER", "BITTER", "SYRUP", "JUICE", "GARNISH", "OTHER",
];

const CATEGORY_COLORS: Record<string, "default" | "warning" | "info" | "success" | "danger"> = {
  SPIRIT: "warning",
  MIXER: "info",
  BITTER: "danger",
  SYRUP: "success",
  JUICE: "success",
  GARNISH: "default",
  OTHER: "default",
};

interface Props {
  barIngredients: Ingredient[];
  globalIngredients: Ingredient[];
}

export function IngredientsManager({ barIngredients: initial, globalIngredients }: Props) {
  const [barIngredients, setBarIngredients] = useState(initial);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("SPIRIT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("category", category);

    const result = await createIngredientAction(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.ingredient) {
      setBarIngredients((prev) => [...prev, result.ingredient as Ingredient]);
      setName("");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteIngredientAction(id);
    if (!result?.error) {
      setBarIngredients((prev) => prev.filter((i) => i.id !== id));
    }
  }

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      const items = barIngredients.filter((i) => i.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<string, Ingredient[]>
  );

  return (
    <div className="space-y-6">
      {/* Add ingredient form */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-stone-900">Add a new ingredient</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex items-end gap-3 flex-wrap">
            <Field label="Name" className="flex-1 min-w-40">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Campari"
                required
              />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" size="sm" disabled={loading}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </form>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Bar ingredients */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-stone-900">Your bar ingredients</h3>
        </CardHeader>
        <CardContent>
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-stone-400 py-2">No bar-specific ingredients yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </div>
                  <div className="space-y-1">
                    {items.map((ing) => (
                      <div
                        key={ing.id}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-stone-50 group"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={CATEGORY_COLORS[ing.category]}>
                            {ing.category.charAt(0) + ing.category.slice(1).toLowerCase()}
                          </Badge>
                          <span className="text-sm text-stone-800">{ing.name}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(ing.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global ingredients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">Global ingredients</h3>
            <Badge variant="info">{globalIngredients.length} available</Badge>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">
            These common ingredients are available to every bar automatically.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {globalIngredients.map((ing) => (
              <Badge key={ing.id} variant={CATEGORY_COLORS[ing.category]}>
                {ing.name}
              </Badge>
            ))}
            {globalIngredients.length === 0 && (
              <p className="text-sm text-stone-400">No global ingredients seeded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
