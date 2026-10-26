const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://fpfdiwvglralkjenbvjx.supabase.co";

export function storageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function eventCoverUrl(path: string | null): string | null {
  if (!path) return null;
  return storageUrl("community-media", path);
}
