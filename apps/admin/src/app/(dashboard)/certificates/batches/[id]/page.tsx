import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { BatchDetail } from "./batch-detail";

export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("certificates.view");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: batch } = await supabase
    .from("certificate_batches")
    .select("*")
    .eq("id", id)
    .single();

  if (!batch) notFound();

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, certificate_number, verification_token, recipient_name, recipient_email, status, issued_at, revoked_at, revocation_reason")
    .eq("batch_id", id)
    .order("certificate_number");

  const canRevoke = session.permissions.includes("certificates.revoke");

  return (
    <BatchDetail
      batch={batch}
      certificates={certificates ?? []}
      canRevoke={canRevoke}
    />
  );
}
