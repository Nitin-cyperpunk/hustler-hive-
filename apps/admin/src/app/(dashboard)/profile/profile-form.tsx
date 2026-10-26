"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Code,
  Globe,
  Phone,
  Eye,
  Camera,
  Save,
  Github,
  Linkedin,
  Instagram,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateProfile, uploadAvatar } from "./actions";

interface ProfileData {
  fullName: string;
  avatarUrl: string | null;
  bio: string;
  college: string;
  branch: string;
  graduationYear: number | null;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  xUrl: string;
  portfolioUrl: string;
  contactNumber: string;
  publicProfile: boolean;
}

export function ProfileForm({
  profile,
  role,
  department,
}: {
  profile: ProfileData | null;
  role: string;
  department: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatarUrl ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [publicProfile, setPublicProfile] = useState(
    profile?.publicProfile ?? false
  );

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar file too large (max 5 MB).");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("avatar", file);

    startTransition(async () => {
      const result = await uploadAvatar(formData);
      setIsUploading(false);
      if (result.error) {
        setError(result.error);
      } else if (result.avatarUrl) {
        setAvatarPreview(result.avatarUrl);
      }
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    // Append the switch value since it's not a regular form field
    formData.set("public_profile", publicProfile ? "on" : "");

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    operations: "Operations",
    social_media: "Social Media",
    creative: "Creative",
    logistics: "Logistics",
    volunteer: "Volunteer",
    member: "Member",
  };

  const DEPT_LABELS: Record<string, string> = {
    operations: "Operations",
    social_media: "Social Media",
    creative: "Creative",
    logistics: "Logistics",
    general: "General",
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Role and Department badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{ROLE_LABELS[role] ?? role}</Badge>
        {department && (
          <Badge variant="secondary">
            {DEPT_LABELS[department] ?? department}
          </Badge>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Profile updated successfully.
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover border border-brand-border"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/10 text-xl font-bold text-brand-cyan border border-brand-border">
                  {profile?.fullName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
                disabled={isUploading}
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-sm text-brand-muted">
              {isUploading ? "Uploading..." : "Click the camera icon to change your avatar"}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              defaultValue={profile?.fullName ?? ""}
              placeholder="Your full name"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ""}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                name="college"
                defaultValue={profile?.college ?? ""}
                placeholder="e.g. IIT Delhi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                name="branch"
                defaultValue={profile?.branch ?? ""}
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation_year">Graduation Year</Label>
            <Input
              id="graduation_year"
              name="graduation_year"
              type="number"
              min={2000}
              max={2040}
              defaultValue={profile?.graduationYear ?? ""}
              placeholder="e.g. 2025"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="h-4 w-4" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="skills">Skills (comma separated)</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={profile?.skills?.join(", ") ?? ""}
            placeholder="e.g. React, TypeScript, Figma, Video Editing"
          />
          <p className="text-xs text-brand-muted">
            Separate each skill with a comma
          </p>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github_url" className="flex items-center gap-2">
              <Github className="h-3.5 w-3.5" />
              GitHub
            </Label>
            <Input
              id="github_url"
              name="github_url"
              type="url"
              defaultValue={profile?.githubUrl ?? ""}
              placeholder="https://github.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              defaultValue={profile?.linkedinUrl ?? ""}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="flex items-center gap-2">
              <Instagram className="h-3.5 w-3.5" />
              Instagram
            </Label>
            <Input
              id="instagram_url"
              name="instagram_url"
              type="url"
              defaultValue={profile?.instagramUrl ?? ""}
              placeholder="https://instagram.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="x_url" className="flex items-center gap-2">
              <X className="h-3.5 w-3.5" />
              X / Twitter
            </Label>
            <Input
              id="x_url"
              name="x_url"
              type="url"
              defaultValue={profile?.xUrl ?? ""}
              placeholder="https://x.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio_url" className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              Portfolio
            </Label>
            <Input
              id="portfolio_url"
              name="portfolio_url"
              type="url"
              defaultValue={profile?.portfolioUrl ?? ""}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="contact_number">Phone Number</Label>
          <Input
            id="contact_number"
            name="contact_number"
            type="tel"
            defaultValue={profile?.contactNumber ?? ""}
            placeholder="+91 98765 43210"
          />
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-text">
                Public Profile
              </p>
              <p className="text-xs text-brand-muted">
                Show your profile on the public team page
              </p>
            </div>
            <Switch
              checked={publicProfile}
              onCheckedChange={setPublicProfile}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
