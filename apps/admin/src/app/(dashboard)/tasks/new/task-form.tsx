"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Member = {
  user_id: string;
  name: string;
  role: string;
  department: string | null;
};

type Event = {
  id: string;
  title: string;
};

export function TaskForm({
  action,
  members,
  events,
}: {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  members: Member[];
  events: Event[];
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await action(formData);
      if (result && "error" in result) return result;
      return null;
    },
    null
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="rounded-md border border-brand-error/30 bg-brand-error/10 px-4 py-3 text-sm text-brand-error">
              {state.error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-brand-error">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the task details..."
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department">
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>

            {/* Event */}
            <div className="space-y-2">
              <Label htmlFor="event_id">Linked Event</Label>
              <Select name="event_id">
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select name="assigned_to">
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Is Claimable */}
          <div className="flex items-center gap-2">
            <Checkbox id="is_claimable" name="is_claimable" />
            <Label htmlFor="is_claimable" className="cursor-pointer">
              Allow team members to claim this task
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Task"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
