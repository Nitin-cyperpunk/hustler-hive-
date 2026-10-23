import { getSiteSettings } from "@/lib/supabase/queries";
import { FooterClient } from "./footer-client";

export async function Footer() {
  let socials: Record<string, string> = {};
  let whatsappUrl: string | undefined;

  try {
    const settings = await getSiteSettings();
    socials = (settings.social_links ?? {}) as Record<string, string>;
    whatsappUrl = settings.whatsapp_invite_url ?? undefined;
  } catch {
    // Supabase unavailable — render footer without dynamic data
  }

  return <FooterClient whatsappUrl={whatsappUrl} socials={socials} />;
}
