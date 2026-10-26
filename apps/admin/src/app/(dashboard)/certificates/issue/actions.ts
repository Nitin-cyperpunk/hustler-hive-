"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";

const VERIFY_BASE_URL = "https://hustlerhive.vercel.app/verify/certificate";

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

interface DesignField {
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  align?: string;
}

interface QrField {
  x: number;
  y: number;
  size: number;
}

interface DesignConfig {
  nameField?: DesignField;
  titleField?: DesignField;
  dateField?: DesignField;
  certNumberField?: DesignField;
  qrCode?: QrField;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  );
}

async function generateCertificatePdf(
  backgroundBytes: ArrayBuffer,
  backgroundType: string,
  canvasWidth: number,
  canvasHeight: number,
  config: DesignConfig,
  recipientName: string,
  certTitle: string,
  certNumber: string,
  issuedAt: Date,
  verifyUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([canvasWidth, canvasHeight]);

  if (backgroundType.includes("png")) {
    const bgImage = await pdfDoc.embedPng(backgroundBytes);
    page.drawImage(bgImage, { x: 0, y: 0, width: canvasWidth, height: canvasHeight });
  } else {
    const bgImage = await pdfDoc.embedJpg(backgroundBytes);
    page.drawImage(bgImage, { x: 0, y: 0, width: canvasWidth, height: canvasHeight });
  }

  const font = await pdfDoc.embedFont("Helvetica");
  const fontBold = await pdfDoc.embedFont("Helvetica-Bold");

  function drawTextField(text: string, field: DesignField | undefined, useBold = false) {
    if (!field) return;
    const f = useBold ? fontBold : font;
    const textWidth = f.widthOfTextAtSize(text, field.fontSize);
    let xPos = field.x * canvasWidth;
    if (field.align === "center") xPos -= textWidth / 2;
    else if (field.align === "right") xPos -= textWidth;
    const yPos = canvasHeight - field.y * canvasHeight;

    page.drawText(text, {
      x: xPos,
      y: yPos,
      size: field.fontSize,
      font: f,
      color: hexToRgb(field.fontColor),
    });
  }

  drawTextField(recipientName, config.nameField, true);
  drawTextField(certTitle, config.titleField);
  drawTextField(
    issuedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    config.dateField
  );
  drawTextField(certNumber, config.certNumberField);

  if (config.qrCode) {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: config.qrCode.size * 3,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const qrBytes = Uint8Array.from(
      atob(qrDataUrl.split(",")[1]),
      (c) => c.charCodeAt(0)
    );
    const qrImage = await pdfDoc.embedPng(qrBytes);
    const qrSize = config.qrCode.size;
    page.drawImage(qrImage, {
      x: config.qrCode.x * canvasWidth - qrSize / 2,
      y: canvasHeight - config.qrCode.y * canvasHeight - qrSize / 2,
      width: qrSize,
      height: qrSize,
    });
  }

  return pdfDoc.save();
}

export async function issueBatch(
  templateId: string,
  certificateTitle: string,
  eventName: string,
  batchName: string,
  recipients: Recipient[]
): Promise<IssueBatchResult> {
  const session = await requireAdmin("operations");
  const supabase = await createServerSupabaseClient();

  if (!templateId || !certificateTitle || recipients.length === 0) {
    throw new Error("Template, title, and at least one recipient are required");
  }

  if (recipients.length > 500) {
    throw new Error("Maximum 500 recipients per batch");
  }

  const { data: template } = await supabase
    .from("certificate_templates")
    .select("id, status, background_storage_path, canvas_width, canvas_height, design_config")
    .eq("id", templateId)
    .single();

  if (!template || template.status !== "active") {
    throw new Error("Selected template is not active");
  }

  const { data: bgFile } = await supabase.storage
    .from("certificates")
    .download(template.background_storage_path);

  let bgBytes: ArrayBuffer | null = null;
  let bgType = "image/png";
  if (bgFile) {
    bgBytes = await bgFile.arrayBuffer();
    bgType = bgFile.type;
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
  const designConfig = (template.design_config ?? {}) as DesignConfig;
  const issuedAt = new Date();

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const certNumber = generateCertNumber(startIndex + i);
    const token = generateToken();
    const verifyUrl = `${VERIFY_BASE_URL}/${token}`;

    try {
      let storagePath: string | null = null;

      if (bgBytes) {
        const pdfBytes = await generateCertificatePdf(
          bgBytes,
          bgType,
          template.canvas_width,
          template.canvas_height,
          designConfig,
          r.name.trim(),
          certificateTitle,
          certNumber,
          issuedAt,
          verifyUrl
        );

        storagePath = `generated/${batch.id}/${certNumber}.pdf`;
        const { error: uploadErr } = await supabase.storage
          .from("certificates")
          .upload(storagePath, pdfBytes, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadErr) throw uploadErr;
      }

      const { error: insertErr } = await supabase.from("certificates").insert({
        certificate_number: certNumber,
        verification_token: token,
        batch_id: batch.id,
        template_id: templateId,
        recipient_name: r.name.trim(),
        recipient_email: r.email?.trim() || null,
        certificate_title: certificateTitle,
        event_name: eventName || null,
        issued_by: session.userId,
        issued_at: issuedAt.toISOString(),
        status: "valid" as const,
        file_storage_path: storagePath,
      });

      if (insertErr) throw insertErr;
      successCount++;
    } catch {
      failureCount++;
    }
  }

  await supabase
    .from("certificate_batches")
    .update({
      status: failureCount === recipients.length ? "failed" : "completed",
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
