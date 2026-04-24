"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  updateMenuAction,
  deleteMenuAction,
  addRecipeToMenuAction,
  removeRecipeFromMenuAction,
} from "@/lib/actions/menu";
import { Trash2, ExternalLink, Plus } from "lucide-react";
import type { Menu, MenuItem, Recipe } from "@prisma/client";

type MenuItemWithRecipe = MenuItem & { recipe: Recipe };

interface Props {
  menu: Menu;
  menuItems: MenuItemWithRecipe[];
  publishedRecipes: Recipe[];
  barSlug: string;
}

export function MenuEditor({ menu, menuItems: initial, publishedRecipes, barSlug }: Props) {
  const [items, setItems] = useState(initial);
  const [isPublic, setIsPublic] = useState(menu.isPublic);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inMenuIds = new Set(items.map((i) => i.recipeId));
  const availableRecipes = publishedRecipes.filter((r) => !inMenuIds.has(r.id));

  async function handleAddRecipe(recipeId: string) {
    setSaving(true);
    const result = await addRecipeToMenuAction(menu.id, recipeId);
    if (!result?.error) {
      const recipe = publishedRecipes.find((r) => r.id === recipeId)!;
      setItems((prev) => [
        ...prev,
        { id: "", menuId: menu.id, recipeId, order: prev.length + 1, recipe },
      ]);
    }
    setSaving(false);
  }

  async function handleRemoveRecipe(recipeId: string) {
    setSaving(true);
    await removeRecipeFromMenuAction(menu.id, recipeId);
    setItems((prev) => prev.filter((i) => i.recipeId !== recipeId));
    setSaving(false);
  }

  async function handleUpdateMenu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.set("isPublic", isPublic ? "on" : "off");
    const result = await updateMenuAction(menu.id, formData);
    if (result?.error) setError(result.error);
    else setShowEdit(false);
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this menu? This cannot be undone.")) return;
    await deleteMenuAction(menu.id);
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {isPublic && (
          <Link href={`/bar/${barSlug}/menu/${menu.id}`} target="_blank">
            <Button variant="secondary" size="sm">
              <ExternalLink className="w-4 h-4" />
              View public menu
            </Button>
          </Link>
        )}
        <Button variant="secondary" size="sm" onClick={() => setShowEdit(!showEdit)}>
          Edit details
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      {/* Edit form */}
      {showEdit && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-stone-900">Edit menu details</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateMenu} className="space-y-4">
              <Field label="Name" required>
                <Input name="name" defaultValue={menu.name} required />
              </Field>
              <Field label="Description">
                <Textarea name="description" defaultValue={menu.description ?? ""} rows={2} />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300"
                />
                <span className="text-sm text-stone-700">Public menu</span>
              </label>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>Save</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowEdit(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current recipes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-900">Recipes on this menu</h3>
            <Badge>{items.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-stone-400 py-2">No recipes assigned yet. Add one below.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.recipeId}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-stone-50 group"
                >
                  <div>
                    <span className="text-sm font-medium text-stone-800">{item.recipe.name}</span>
                    {item.recipe.description && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.recipe.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveRecipe(item.recipeId)}
                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-colors ml-4"
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add recipes */}
      {availableRecipes.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-stone-900">Add published recipes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-stone-50"
                >
                  <span className="text-sm text-stone-800">{recipe.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddRecipe(recipe.id)}
                    disabled={saving}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {availableRecipes.length === 0 && items.length > 0 && (
        <p className="text-sm text-stone-400 text-center py-4">
          All published recipes are on this menu.{" "}
          <Link href="/dashboard/recipes" className="text-amber-600 hover:underline">
            Create more recipes
          </Link>
        </p>
      )}
    </div>
  );
}
