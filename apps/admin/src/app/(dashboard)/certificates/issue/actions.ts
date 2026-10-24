"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

function generateCertNumber(index: number): string {
  const year = new Date().getFullYear();
  const padded = String(index).padStart(4, "0");
  return `HH-${year}-${padded}`;
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  for (const b of bytes) {
    token += chars[b % chars.length];
  }
  return token;
}

export interface Recipient {
  name: string;
  email: string;
}

export interface IssueBatchResult {
  batchId: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export async function issueBatch(
  templateId: string,
  certificateTitle: string,
  eventName: string,
  batchName: string,
  recipients: Recipient[]
): Promise<IssueBatchResult> {
  const session = await requirePermission("certificates.issue");
  const supabase = await createServerSupabaseClient();

  if (!templateId || !certificateTitle || recipients.length === 0) {
    throw new Error("Template, title, and at least one recipient are required");
  }

  const { data: template } = await supabase
    .from("certificate_templates")
    .select("id, status")
    .eq("id", templateId)
    .single();

  if (!template || template.status !== "active") {
    throw new Error("Selected template is not active");
  }

  const { data: batch, error: batchError } = await supabase
    .from("certificate_batches")
    .insert({
      name: batchName || `Batch ${new Date().toISOString().slice(0, 10)}`,
      template_id: templateId,
      certificate_title: certificateTitle,
      event_name: eventName || null,
      issued_by: session.userId,
      status: "processing",
      total_count: recipients.length,
    })
    .select("id")
    .single();

  if (batchError || !batch) {
    throw new Error(`Failed to create batch: ${batchError?.message}`);
  }

  const { count: existingCount } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true });

  const startIndex = (existingCount ?? 0) + 1;

  let successCount = 0;
  let failureCount = 0;

  const certRows = recipients.map((r, i) => ({
    certificate_number: generateCertNumber(startIndex + i),
    verification_token: generateToken(),
    batch_id: batch.id,
    template_id: templateId,
    recipient_name: r.name.trim(),
    recipient_email: r.email?.trim() || null,
    certificate_title: certificateTitle,
    event_name: eventName || null,
    issued_by: session.userId,
    status: "valid" as const,
  }));

  const { error: insertError } = await supabase
    .from("certificates")
    .insert(certRows);

  if (insertError) {
    failureCount = recipients.length;
  } else {
    successCount = recipients.length;
  }

  await supabase
    .from("certificate_batches")
    .update({
      status: failureCount > 0 ? "failed" : "completed",
      success_count: successCount,
      failure_count: failureCount,
      completed_at: new Date().toISOString(),
    })
    .eq("id", batch.id);

  await supabase.from("audit_logs").insert({
    actor_id: session.userId,
    action: "certificate_batch.issue",
    target_type: "certificate_batch",
    target_id: batch.id,
    metadata: {
      template_id: templateId,
      certificate_title: certificateTitle,
      total: recipients.length,
      success: successCount,
      failure: failureCount,
    },
  });

  revalidatePath("/certificates");
  return {
    batchId: batch.id,
    totalCount: recipients.length,
    successCount,
    failureCount,
  };
}
