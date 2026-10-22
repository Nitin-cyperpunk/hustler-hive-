import { requireAdmin } from "@/lib/auth";
import { EventForm } from "@/components/event-form";
import { createEvent } from "../actions";

export default async function NewEventPage() {
  await requireAdmin("editor");

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-white">Create Event</h1>
      <EventForm action={createEvent} />
    </div>
  );
}
