import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  Hash,
  User,
} from "lucide-react";

const SITE_URL = "https://hustlerhive.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase.rpc("verify_certificate", { token });
  const cert = data?.[0];

  if (!cert) {
    return {
      title: "Certificate Not Found | Hustlers Hive",
      description: "This certificate could not be found in our system.",
    };
  }

  return {
    title: `Certificate Verification — ${cert.recipient_name} | Hustlers Hive`,
    description: `${cert.certificate_title} issued to ${cert.recipient_name}${cert.event_name ? ` for ${cert.event_name}` : ""}`,
    openGraph: {
      title: `Certificate: ${cert.recipient_name}`,
      description: `${cert.certificate_title} — verified by Hustlers Hive`,
      url: `${SITE_URL}/verify/certificate/${token}`,
      siteName: "Hustlers Hive",
    },
  };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("verify_certificate", { token });
  const cert = data?.[0];

  if (error || !cert) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B12] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#0D1422] p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h1 className="mt-4 text-xl font-bold text-white">
            Certificate Not Found
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            We couldn&apos;t find a certificate matching this verification link.
            Please check the URL or contact Hustlers Hive for assistance.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-[#22D3EE]/10 px-6 py-2.5 text-sm font-medium text-[#22D3EE] transition-colors hover:bg-[#22D3EE]/20"
          >
            Go to Homepage
          </a>
        </div>
      </main>
    );
  }

  const isValid = cert.status === "valid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080B12] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#0D1422] p-8">
        <div className="text-center">
          {isValid ? (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
          )}

          <h1 className="mt-4 text-xl font-bold text-white">
            {isValid ? "Certificate Verified" : "Certificate Revoked"}
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {isValid
              ? "This is an authentic certificate issued by Hustlers Hive."
              : "This certificate has been revoked and is no longer valid."}
          </p>
        </div>

        <div className="mt-8 space-y-4 rounded-xl border border-[#1E293B] bg-[#121C2C] p-5">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Issued To</p>
              <p className="text-sm font-medium text-white">
                {cert.recipient_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Certificate</p>
              <p className="text-sm font-medium text-white">
                {cert.certificate_title}
              </p>
            </div>
          </div>

          {cert.event_name && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
              <div>
                <p className="text-xs text-[#94A3B8]">Event</p>
                <p className="text-sm font-medium text-white">
                  {cert.event_name}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Issued On</p>
              <p className="text-sm font-medium text-white">
                {new Date(cert.issued_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Hash className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
            <div>
              <p className="text-xs text-[#94A3B8]">Certificate Number</p>
              <p className="font-mono text-sm font-medium text-white">
                {cert.certificate_number}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-[#1E293B] bg-[#080B12] p-3 text-center">
          <p className="text-xs text-[#94A3B8]">
            Verified by{" "}
            <a href="/" className="font-medium text-[#22D3EE] hover:underline">
              Hustlers Hive
            </a>{" "}
            — Student-driven technology community, Nashik
          </p>
        </div>
      </div>
    </main>
  );
}
