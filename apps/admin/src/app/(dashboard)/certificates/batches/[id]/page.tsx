import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { BatchDetail } from "./batch-detail";

export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin("operations");
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
    .select("id, certificate_number, verification_token, recipient_name, recipient_email, status, file_storage_path, issued_at, revoked_at, revocation_reason")
    .eq("batch_id", id)
    .order("certificate_number");

  const canRevoke = session.role === "super_admin";

  const certsWithUrls = (certificates ?? []).map((cert) => {
    let downloadUrl: string | null = null;
    if (cert.file_storage_path) {
      const { data } = supabase.storage
        .from("certificates")
        .getPublicUrl(cert.file_storage_path);
      downloadUrl = data.publicUrl;
    }
    return { ...cert, downloadUrl };
  });

  return (
    <BatchDetail
      batch={batch}
      certificates={certsWithUrls}
      canRevoke={canRevoke}
    />
  );
}
