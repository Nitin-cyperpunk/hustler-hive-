"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { updateSettings } from "@/app/(dashboard)/settings/actions";

interface SocialLinks {
  github?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export function SettingsForm({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const social = (content.social_links ?? {}) as SocialLinks;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-sm text-green-400">
          <Check className="h-4 w-4" />
          Settings saved.
        </div>
      )}

      <Section title="SEO">
        <Field label="SEO Title">
          <input name="seo_title" defaultValue={(content.seo_title as string) ?? ""} className="input-field" />
        </Field>
        <Field label="SEO Description">
          <textarea name="seo_description" rows={2} defaultValue={(content.seo_description as string) ?? ""} className="input-field" />
        </Field>
      </Section>

      <Section title="Community">
        <Field label="Community Introduction">
          <textarea name="community_intro" rows={4} defaultValue={(content.community_intro as string) ?? ""} className="input-field" />
        </Field>
        <Field label="Announcement">
          <input name="announcement" defaultValue={(content.announcement as string) ?? ""} className="input-field" />
        </Field>
        <Field label="WhatsApp Invite URL">
          <input name="whatsapp_invite_url" type="url" defaultValue={(content.whatsapp_invite_url as string) ?? ""} placeholder="https://chat.whatsapp.com/..." className="input-field" />
        </Field>
      </Section>

      <Section title="Social Links">
        <Field label="GitHub"><input name="social_github" type="url" defaultValue={social.github ?? ""} className="input-field" /></Field>
        <Field label="Twitter / X"><input name="social_twitter" type="url" defaultValue={social.twitter ?? ""} className="input-field" /></Field>
        <Field label="Instagram"><input name="social_instagram" type="url" defaultValue={social.instagram ?? ""} className="input-field" /></Field>
        <Field label="LinkedIn"><input name="social_linkedin" type="url" defaultValue={social.linkedin ?? ""} className="input-field" /></Field>
        <Field label="YouTube"><input name="social_youtube" type="url" defaultValue={social.youtube ?? ""} className="input-field" /></Field>
      </Section>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Save settings
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">{label}</label>
      {children}
    </div>
  );
}
