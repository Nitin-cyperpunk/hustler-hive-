"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPost } from "../actions";

const PLATFORMS = [
  "Instagram",
  "Twitter/X",
  "LinkedIn",
  "Facebook",
  "YouTube",
] as const;

interface EventOption {
  id: string;
  title: string;
}

export function NewPostForm({ events }: { events: EventOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [eventId, setEventId] = useState<string>("");

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);

    // Remove any existing platform entries and add selected ones
    formData.delete("platform");
    for (const p of selectedPlatforms) {
      formData.append("platform", p);
    }

    // Set event_id from state
    if (eventId && eventId !== "none") {
      formData.set("event_id", eventId);
    } else {
      formData.delete("event_id");
    }

    startTransition(async () => {
      const result = await createPost(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/social-media");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="mb-2">
        <Link href="/social-media">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Social Media
        </Link>
      </Button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Post title"
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              name="caption"
              placeholder="Write your caption..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Platforms *</Label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <span className="text-sm text-brand-text">{platform}</span>
                </label>
              ))}
            </div>
            {selectedPlatforms.length === 0 && (
              <p className="text-xs text-brand-muted">
                Select at least one platform
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                name="campaign"
                placeholder="e.g. Hacktoberfest 2026"
              />
            </div>

            <div className="space-y-2">
              <Label>Linked Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No event</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_for">Scheduled For</Label>
            <Input
              id="scheduled_for"
              name="scheduled_for"
              type="datetime-local"
            />
            <p className="text-xs text-brand-muted">
              When should this post be published?
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/social-media">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
