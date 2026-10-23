import { getSiteSettings } from "@/lib/supabase/queries";
import { FooterClient } from "./footer-client";

export async function Footer() {
  const settings = await getSiteSettings();
  const socials = (settings.social_links ?? {}) as Record<string, string>;
  const whatsappUrl = settings.whatsapp_invite_url ?? undefined;

  return <FooterClient whatsappUrl={whatsappUrl} socials={socials} />;
}
