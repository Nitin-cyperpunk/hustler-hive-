"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

export async function revokeCertificate(
  certificateId: string,
  reason: string
) {
  const session = await requirePermission("certificates.revoke");
  const supabase = await createServerSupabaseClient();

  const { data: cert } = await supabase
    .from("certificates")
    .select("id, status, batch_id, certificate_number")
    .eq("id", certificateId)
    .single();

  if (!cert) throw new Error("Certificate not found");
  if (cert.status === "revoked") throw new Error("Certificate already revoked");

  const { error } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_by: session.userId,
      revocation_reason: reason || "No reason provided",
      updated_at: new Date().toISOString(),
    })
    .eq("id", certificateId);

  if (error) throw new Error(`Failed to revoke: ${error.message}`);

  await supabase.from("audit_logs").insert({
    actor_id: session.userId,
    action: "certificate.revoke",
    target_type: "certificate",
    target_id: certificateId,
    metadata: {
      certificate_number: cert.certificate_number,
      reason,
    },
  });

  revalidatePath(`/certificates/batches/${cert.batch_id}`);
  revalidatePath("/certificates");
}

export async function reinstateCertificate(certificateId: string) {
  const session = await requirePermission("certificates.revoke");
  const supabase = await createServerSupabaseClient();

  const { data: cert } = await supabase
    .from("certificates")
    .select("id, status, batch_id, certificate_number")
    .eq("id", certificateId)
    .single();

  if (!cert) throw new Error("Certificate not found");
  if (cert.status !== "revoked") throw new Error("Certificate is not revoked");

  const { error } = await supabase
    .from("certificates")
    .update({
      status: "valid",
      revoked_at: null,
      revoked_by: null,
      revocation_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", certificateId);

  if (error) throw new Error(`Failed to reinstate: ${error.message}`);

  await supabase.from("audit_logs").insert({
    actor_id: session.userId,
    action: "certificate.reinstate",
    target_type: "certificate",
    target_id: certificateId,
    metadata: { certificate_number: cert.certificate_number },
  });

  revalidatePath(`/certificates/batches/${cert.batch_id}`);
  revalidatePath("/certificates");
}
