"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { updateSettings } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-brand-error/20 bg-brand-error/5 px-3 py-2.5 text-sm text-brand-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-success/20 bg-brand-success/5 px-3 py-2.5 text-sm text-brand-success">
          <Check className="h-4 w-4" />
          Settings saved.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input id="seo_title" name="seo_title" defaultValue={(content.seo_title as string) ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Textarea id="seo_description" name="seo_description" rows={2} defaultValue={(content.seo_description as string) ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="community_intro">Community Introduction</Label>
            <Textarea id="community_intro" name="community_intro" rows={4} defaultValue={(content.community_intro as string) ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement">Announcement</Label>
            <Input id="announcement" name="announcement" defaultValue={(content.announcement as string) ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_invite_url">WhatsApp Invite URL</Label>
            <Input id="whatsapp_invite_url" name="whatsapp_invite_url" type="url" defaultValue={(content.whatsapp_invite_url as string) ?? ""} placeholder="https://chat.whatsapp.com/..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social_github">GitHub</Label>
            <Input id="social_github" name="social_github" type="url" defaultValue={social.github ?? ""} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="social_twitter">Twitter / X</Label>
            <Input id="social_twitter" name="social_twitter" type="url" defaultValue={social.twitter ?? ""} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input id="social_instagram" name="social_instagram" type="url" defaultValue={social.instagram ?? ""} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="social_linkedin">LinkedIn</Label>
            <Input id="social_linkedin" name="social_linkedin" type="url" defaultValue={social.linkedin ?? ""} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input id="social_youtube" name="social_youtube" type="url" defaultValue={social.youtube ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
