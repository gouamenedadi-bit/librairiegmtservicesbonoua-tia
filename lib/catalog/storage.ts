// Pure helpers, deliberately isolated from lib/catalog/queries.ts (which
// imports the Supabase *server* client): Client Components need these too
// (see components/admin/image-manager.tsx), and importing anything from a
// module that pulls in `next/headers` breaks the client bundle even if the
// specific export you wanted doesn't touch it.

export function primaryImagePath(
  images: { storage_path: string; position: number; is_primary: boolean }[] | null | undefined,
): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary) ?? [...images].sort((a, b) => a.position - b.position)[0];
  return primary.storage_path;
}

export function storagePublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/products/${path}`;
}
