import type { Metadata } from "next";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublishedGalleryImages } from "@/lib/supabase/queries";
import { ICONS, TEXTURES } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and moments from Hustlers Hive events, workshops, and community gatherings.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getPublishedGalleryImages();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: `url(${TEXTURES.darkGrain})`, backgroundSize: "cover" }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Image
                src={ICONS.features.gallery}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
                style={{ filter: "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)" }}
              />
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
                Gallery
              </p>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Moments from the Hive
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-brand-muted">
              Snapshots from our events, workshops, and community gatherings.
            </p>

            {images.length === 0 ? (
              <div className="mt-16 rounded-xl border border-dashed border-brand-border p-16 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-brand-muted/40" />
                <p className="mt-4 text-lg text-brand-muted">
                  Gallery coming soon. Stay tuned for photos from our events!
                </p>
              </div>
            ) : (
              <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-brand-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.storage_path}
                      alt={img.alt_text || "Community photo"}
                      className="w-full"
                      loading="lazy"
                    />
                    {img.caption && (
                      <div className="bg-brand-surface/80 px-3 py-2">
                        <p className="text-sm text-brand-muted">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
