import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { EventForm } from "@/components/event-form";
import { updateEvent } from "../../actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateEvent(id, formData);
  }

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-white">Edit Event</h1>
      <EventForm event={event} action={handleUpdate} />
    </div>
  );
}
