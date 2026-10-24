"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB — a 1000x1000 webp product photo is a few hundred KB

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `file.type` is the browser/client's own claim about a file's content —
 * trivially spoofable in a direct request to this action. Checking the
 * actual leading bytes (the real image format signature) before trusting
 * the extension/content-type we upload with closes that gap.
 */
function detectRealImageExt(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "png";
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "webp";
  return null;
}

export async function uploadProductImages(
  productId: string,
  formData: FormData,
): Promise<{ error: string } | { uploaded: number; warning?: string }> {
  if (!(await requireAdmin())) return { error: "Non autorisé." };
  if (!UUID_RE.test(productId)) return { error: "Produit invalide." };

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Sélectionnez au moins une image." };

  const supabase = await createClient();

  const { count: existingCount } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  let uploaded = 0;
  let hasPrimary = (existingCount ?? 0) > 0;
  let unsupported = 0;
  let failed = 0;

  for (const file of files) {
    const claimedExt = CONTENT_TYPE_TO_EXT[file.type];
    if (!claimedExt) {
      unsupported += 1;
      continue; // skip unsupported types rather than fail the whole batch
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      failed += 1;
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Don't trust the client-declared content-type alone — confirm the
    // actual bytes really are that image format before storing/serving them
    // as such.
    const realExt = detectRealImageExt(buffer);
    if (!realExt || realExt !== claimedExt) {
      unsupported += 1;
      continue;
    }

    const contentHash = createHash("sha256").update(buffer).digest("hex");
    const storagePath = `${productId}/${contentHash.slice(0, 24)}.${realExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });
    if (uploadError) {
      failed += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("product_images").upsert(
      {
        product_id: productId,
        storage_path: storagePath,
        content_hash: contentHash,
        source: "manual",
        is_primary: !hasPrimary,
      },
      { onConflict: "product_id,content_hash" },
    );
    if (insertError) {
      failed += 1;
      continue;
    }

    hasPrimary = true;
    uploaded += 1;
  }

  revalidatePath(`/admin/produits/${productId}`);

  if (uploaded === 0 && (unsupported > 0 || failed > 0)) {
    return {
      error:
        unsupported > 0
          ? "Format non supporté — utilisez une photo JPEG, PNG ou WEBP."
          : "L'envoi a échoué. Vérifiez votre connexion et réessayez.",
    };
  }

  const warning =
    unsupported > 0
      ? `${unsupported} fichier(s) ignoré(s) (format non supporté).`
      : failed > 0
        ? `${failed} fichier(s) n'ont pas pu être envoyés.`
        : undefined;

  return { uploaded, warning };
}

export async function deleteProductImage(imageId: string, productId: string) {
  if (!(await requireAdmin())) return;

  const supabase = await createClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (image) {
    await supabase.storage.from("products").remove([image.storage_path]);
    await supabase.from("product_images").delete().eq("id", imageId);
  }

  revalidatePath(`/admin/produits/${productId}`);
}

export async function setPrimaryImage(imageId: string, productId: string) {
  if (!(await requireAdmin())) return;

  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  revalidatePath(`/admin/produits/${productId}`);
}
