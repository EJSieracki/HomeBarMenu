"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateBarAction, inviteBartenderAction } from "@/lib/actions/bar";
import { Trash2, Users, Copy } from "lucide-react";
import type { Bar, BarStaff, User } from "@prisma/client";

type StaffWithUser = BarStaff & { user: Pick<User, "id" | "name" | "email"> };

interface Props {
  bar: Bar;
  staff: StaffWithUser[];
}

export function BarSettingsForm({ bar, staff: initialStaff }: Props) {
  const [staff, setStaff] = useState(initialStaff);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSaveBar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    const result = await updateBarAction(formData);
    if (result?.error) setError(result.error);
    else setSuccess("Bar details saved.");
    setSaving(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setInviteError("");
    const formData = new FormData();
    formData.set("email", inviteEmail);
    const result = await inviteBartenderAction(formData);
    if (result?.error) setInviteError(result.error);
    else setInviteEmail("");
    setSaving(false);
  }

  function copyPublicUrl() {
    navigator.clipboard.writeText(`${window.location.origin}/bar/${bar.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Bar details */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-stone-900">Bar details</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBar} className="space-y-4">
            <Field label="Bar name" required>
              <Input name="name" defaultValue={bar.name} required />
            </Field>
            <Field label="Description">
              <Textarea name="description" defaultValue={bar.description ?? ""} rows={2} />
            </Field>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" size="sm" disabled={saving}>Save changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Public URL */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-stone-900">Public menu URL</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm bg-stone-100 px-3 py-2 rounded-lg text-stone-700 truncate">
              /bar/{bar.slug}
            </code>
            <Button variant="secondary" size="sm" onClick={copyPublicUrl}>
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Share this URL with your patrons so they can browse your public menus.
          </p>
        </CardContent>
      </Card>

      {/* Bartender team */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-500" />
            <h3 className="font-semibold text-stone-900">Bartender team</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite form */}
          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <Field label="Invite by email" className="flex-1">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="bartender@example.com"
                required
              />
            </Field>
            <Button type="submit" size="sm" disabled={saving}>Invite</Button>
          </form>
          {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}

          {/* Staff list */}
          {staff.length === 0 ? (
            <p className="text-sm text-stone-400">No bartenders on your team yet.</p>
          ) : (
            <div className="space-y-2">
              {staff.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-50">
                  <div>
                    <div className="text-sm font-medium text-stone-800">{s.user.name}</div>
                    <div className="text-xs text-stone-400">{s.user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
