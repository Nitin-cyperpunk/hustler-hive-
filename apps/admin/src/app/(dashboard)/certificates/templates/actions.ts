"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createTemplate(formData: FormData) {
  const session = await requireAdmin("super_admin");
  const supabase = await createServerSupabaseClient();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const canvasWidth = parseInt(formData.get("canvas_width") as string, 10);
  const canvasHeight = parseInt(formData.get("canvas_height") as string, 10);
  const status = (formData.get("status") as string) || "draft";

  if (!name || !canvasWidth || !canvasHeight) {
    throw new Error("Name, width, and height are required");
  }

  const file = formData.get("background") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Background image is required");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const storagePath = `templates/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("certificates")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const designConfigRaw = formData.get("design_config") as string;
  let designConfig = {};
  if (designConfigRaw) {
    try {
      designConfig = JSON.parse(designConfigRaw);
    } catch {
      // keep default empty object
    }
  }

  const { error: insertError } = await supabase
    .from("certificate_templates")
    .insert({
      name,
      description,
      background_storage_path: storagePath,
      canvas_width: canvasWidth,
      canvas_height: canvasHeight,
      design_config: designConfig,
      status: status as "draft" | "active" | "archived",
      created_by: session.userId,
    });

  if (insertError) {
    throw new Error(`Failed to create template: ${insertError.message}`);
  }

  await supabase.from("audit_logs").insert({
    actor_id: session.userId,
    action: "certificate_template.create",
    target_type: "certificate_template",
    metadata: { name },
  });

  revalidatePath("/certificates");
  revalidatePath("/certificates/templates");
  redirect("/certificates/templates");
}

export async function updateTemplate(id: string, formData: FormData) {
  const session = await requireAdmin("super_admin");
  const supabase = await createServerSupabaseClient();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const canvasWidth = parseInt(formData.get("canvas_width") as string, 10);
  const canvasHeight = parseInt(formData.get("canvas_height") as string, 10);
  const status = (formData.get("status") as string) || "draft";

  if (!name || !canvasWidth || !canvasHeight) {
    throw new Error("Name, width, and height are required");
  }

  let backgroundStoragePath: string | undefined;
  const file = formData.get("background") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const storagePath = `templates/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    backgroundStoragePath = storagePath;
  }

  let designConfig: Record<string, unknown> | undefined;
  const designConfigRaw = formData.get("design_config") as string;
  if (designConfigRaw) {
    try {
      designConfig = JSON.parse(designConfigRaw);
    } catch {
      // keep existing config
    }
  }

  const { error: updateError } = await supabase
    .from("certificate_templates")
    .update({
      name,
      description,
      canvas_width: canvasWidth,
      canvas_height: canvasHeight,
      status: status as "draft" | "active" | "archived",
      updated_at: new Date().toISOString(),
      ...(backgroundStoragePath ? { background_storage_path: backgroundStoragePath } : {}),
      ...(designConfig ? { design_config: designConfig as unknown as import("@hustlers-hive/shared/database.types").Json } : {}),
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(`Failed to update template: ${updateError.message}`);
  }

  await supabase.from("audit_logs").insert({
    actor_id: session.userId,
    action: "certificate_template.update",
    target_type: "certificate_template",
    target_id: id,
    metadata: { name, status },
  });

  revalidatePath("/certificates");
  revalidatePath("/certificates/templates");
  redirect("/certificates/templates");
}

export async function deleteTemplate(id: string) {
  const session = await requireAdmin("super_admin");
  const supabase = await createServerSupabaseClient();

  const { data: batches } = await supabase
    .from("certificate_batches")
    .select("id")
    .eq("template_id", id)
    .limit(1);

  if (batches && batches.length > 0) {
    throw new Error("Cannot delete template that has issued certificates");
  }

  const { error } = await supabase
    .from("certificate_templates")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete: ${error.message}`);
  }

  await supabase.from("audit_logs").insert({
    actor_id: session.userId,
    action: "certificate_template.delete",
    target_type: "certificate_template",
    target_id: id,
  });

  revalidatePath("/certificates");
  revalidatePath("/certificates/templates");
  redirect("/certificates/templates");
}
