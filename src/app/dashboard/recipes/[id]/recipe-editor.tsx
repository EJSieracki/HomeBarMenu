"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  publishRecipeAction,
  deleteRecipeAction,
  createVersionAction,
  setActiveVersionAction,
  saveVersionIngredientsAction,
  saveVersionStepsAction,
  updateRecipeAction,
} from "@/lib/actions/recipe";
import {
  Plus,
  Trash2,
  CheckCircle,
  ChevronDown,
  GripVertical,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  Recipe,
  RecipeVersion,
  RecipeVersionIngredient,
  RecipeVersionStep,
  Ingredient,
} from "@prisma/client";

type VersionWithRelations = RecipeVersion & {
  ingredients: (RecipeVersionIngredient & { ingredient: Ingredient })[];
  steps: RecipeVersionStep[];
  createdBy: { name: string | null };
};

type RecipeWithRelations = Recipe & {
  baseClassic: { name: string } | null;
};

interface Props {
  recipe: RecipeWithRelations;
  versions: VersionWithRelations[];
  barIngredients: Ingredient[];
}

const GLASS_TYPES = [
  "COUPE", "MARTINI", "ROCKS", "HIGHBALL", "COLLINS",
  "SHOT", "FLUTE", "WINE", "PINT", "MUG", "TIKI", "OTHER",
];

export function RecipeEditor({ recipe, versions: initialVersions, barIngredients }: Props) {
  const [versions, setVersions] = useState(initialVersions);
  const [activeVersionId, setActiveVersionId] = useState(
    initialVersions.find((v) => v.isActive)?.id ?? initialVersions[0]?.id
  );
  const [published, setPublished] = useState(recipe.isPublished);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [showEditMeta, setShowEditMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentVersion = versions.find((v) => v.id === activeVersionId) ?? versions[0];

  // Ingredient editor state
  const [ingredients, setIngredients] = useState(
    currentVersion?.ingredients.map((i) => ({
      id: i.id,
      ingredientId: i.ingredientId,
      name: i.ingredient.name,
      amount: i.amount,
      unit: i.unit ?? "",
      order: i.order,
      notes: i.notes ?? "",
    })) ?? []
  );

  // Step editor state
  const [steps, setSteps] = useState(
    currentVersion?.steps.map((s) => ({
      stepNumber: s.stepNumber,
      instruction: s.instruction,
    })) ?? []
  );

  function loadVersion(versionId: string) {
    setActiveVersionId(versionId);
    const v = versions.find((v) => v.id === versionId);
    if (!v) return;
    setIngredients(
      v.ingredients.map((i) => ({
        id: i.id,
        ingredientId: i.ingredientId,
        name: i.ingredient.name,
        amount: i.amount,
        unit: i.unit ?? "",
        order: i.order,
        notes: i.notes ?? "",
      }))
    );
    setSteps(v.steps.map((s) => ({ stepNumber: s.stepNumber, instruction: s.instruction })));
  }

  async function handlePublishToggle() {
    setSaving(true);
    await publishRecipeAction(recipe.id, !published);
    setPublished(!published);
    setSaving(false);
  }

  async function handleSetActive() {
    if (!currentVersion) return;
    setSaving(true);
    await setActiveVersionAction(currentVersion.id, recipe.id);
    setVersions((v) =>
      v.map((ver) => ({ ...ver, isActive: ver.id === currentVersion.id }))
    );
    setSaving(false);
  }

  async function handleSaveIngredients() {
    if (!currentVersion) return;
    setSaving(true);
    setError("");
    const result = await saveVersionIngredientsAction(
      currentVersion.id,
      recipe.id,
      ingredients.map((i, idx) => ({
        ingredientId: i.ingredientId,
        amount: i.amount,
        unit: i.unit || undefined,
        order: idx + 1,
        notes: i.notes || undefined,
      }))
    );
    if (result?.error) setError(result.error);
    setSaving(false);
  }

  async function handleSaveSteps() {
    if (!currentVersion) return;
    setSaving(true);
    setError("");
    const result = await saveVersionStepsAction(
      currentVersion.id,
      recipe.id,
      steps.map((s, idx) => ({ stepNumber: idx + 1, instruction: s.instruction }))
    );
    if (result?.error) setError(result.error);
    setSaving(false);
  }

  async function handleNewVersion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await createVersionAction(recipe.id, formData);
    setShowNewVersion(false);
    setSaving(false);
    window.location.reload();
  }

  async function handleDelete() {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    await deleteRecipeAction(recipe.id);
  }

  async function handleUpdateMeta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateRecipeAction(recipe.id, formData);
    setShowEditMeta(false);
    setSaving(false);
    window.location.reload();
  }

  // Ingredient helpers
  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { id: "", ingredientId: "", name: "", amount: "", unit: "", order: prev.length + 1, notes: "" },
    ]);
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, field: string, value: string) {
    setIngredients((prev) => {
      const next = [...prev];
      if (field === "ingredientId") {
        const ing = barIngredients.find((i) => i.id === value);
        next[idx] = { ...next[idx], ingredientId: value, name: ing?.name ?? "" };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  }

  // Step helpers
  function addStep() {
    setSteps((prev) => [...prev, { stepNumber: prev.length + 1, instruction: "" }]);
  }

  function removeStep(idx: number) {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateStep(idx: number, value: string) {
    setSteps((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], instruction: value };
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant={published ? "secondary" : "primary"}
          size="sm"
          onClick={handlePublishToggle}
          disabled={saving}
        >
          {published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {published ? "Unpublish" : "Publish"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowEditMeta(!showEditMeta)}
        >
          Edit details
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={saving}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      {/* Edit meta */}
      {showEditMeta && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-stone-900">Edit recipe details</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateMeta} className="space-y-4">
              <Field label="Recipe name" htmlFor="edit-name" required>
                <Input id="edit-name" name="name" defaultValue={recipe.name} required />
              </Field>
              <Field label="Description">
                <Textarea name="description" defaultValue={recipe.description ?? ""} rows={2} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Glass type">
                  <Select name="glassType" defaultValue={recipe.glassType}>
                    {GLASS_TYPES.map((g) => (
                      <option key={g} value={g}>
                        {g.charAt(0) + g.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Garnish">
                  <Input name="garnish" defaultValue={recipe.garnish ?? ""} placeholder="e.g. Lemon twist" />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>Save</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowEditMeta(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Version tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-stone-900">Versions</h3>
            <Button size="sm" variant="secondary" onClick={() => setShowNewVersion(!showNewVersion)}>
              <Plus className="w-4 h-4" />
              New version
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => loadVersion(v.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  v.id === activeVersionId
                    ? "bg-amber-100 text-amber-700"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {v.name ?? `v${v.versionNumber}`}
                {v.isActive && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
              </button>
            ))}
          </div>
        </CardHeader>

        {showNewVersion && (
          <CardContent className="border-b border-stone-200">
            <form onSubmit={handleNewVersion} className="flex items-end gap-3">
              <Field label="Version name" className="flex-1">
                <Input name="name" placeholder="e.g. Less sweet variation" />
              </Field>
              <Field label="Notes">
                <Input name="notes" placeholder="What changed?" />
              </Field>
              <Button type="submit" size="sm" disabled={saving}>Create</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewVersion(false)}>
                Cancel
              </Button>
            </form>
          </CardContent>
        )}

        {currentVersion && (
          <CardContent className="space-y-1 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-stone-500">
                Created by {currentVersion.createdBy.name ?? "Unknown"}
                {currentVersion.notes && ` · ${currentVersion.notes}`}
              </div>
              {!currentVersion.isActive && (
                <Button size="sm" variant="secondary" onClick={handleSetActive} disabled={saving}>
                  <CheckCircle className="w-4 h-4" />
                  Set as active
                </Button>
              )}
              {currentVersion.isActive && (
                <Badge variant="success">Active version</Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Ingredients editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">Ingredients</h3>
            <Button size="sm" variant="secondary" onClick={addIngredient}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {ingredients.length === 0 && (
            <p className="text-sm text-stone-400 py-2">No ingredients yet. Add one above.</p>
          )}

          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-stone-300 shrink-0" />

              <Select
                value={ing.ingredientId}
                onChange={(e) => updateIngredient(idx, "ingredientId", e.target.value)}
                className="flex-1"
              >
                <option value="">Select ingredient…</option>
                {barIngredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.category.charAt(0) + i.category.slice(1).toLowerCase()}] {i.name}
                  </option>
                ))}
              </Select>

              <Input
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                placeholder="Amount"
                className="w-24"
              />

              <Input
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                placeholder="Unit"
                className="w-20"
              />

              <Input
                value={ing.notes}
                onChange={(e) => updateIngredient(idx, "notes", e.target.value)}
                placeholder="Note"
                className="w-32 hidden md:block"
              />

              <button
                onClick={() => removeIngredient(idx)}
                className="text-stone-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {ingredients.length > 0 && (
            <div className="pt-2">
              <Button size="sm" onClick={handleSaveIngredients} disabled={saving}>
                <Save className="w-4 h-4" />
                Save ingredients
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">Instructions</h3>
            <Button size="sm" variant="secondary" onClick={addStep}>
              <Plus className="w-4 h-4" />
              Add step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.length === 0 && (
            <p className="text-sm text-stone-400 py-2">No steps yet. Add one above.</p>
          )}

          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                {idx + 1}
              </div>
              <Textarea
                value={step.instruction}
                onChange={(e) => updateStep(idx, e.target.value)}
                placeholder={`Step ${idx + 1} instruction…`}
                rows={2}
                className="flex-1"
              />
              <button
                onClick={() => removeStep(idx)}
                className="text-stone-400 hover:text-red-500 transition-colors mt-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {steps.length > 0 && (
            <div className="pt-1">
              <Button size="sm" onClick={handleSaveSteps} disabled={saving}>
                <Save className="w-4 h-4" />
                Save instructions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
