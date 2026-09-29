"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadProductImages(
  productId: string,
  formData: FormData,
): Promise<{ error: string } | { uploaded: number; warning?: string }> {
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
    const ext = CONTENT_TYPE_TO_EXT[file.type];
    if (!ext) {
      unsupported += 1;
      continue; // skip unsupported types rather than fail the whole batch
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentHash = createHash("sha256").update(buffer).digest("hex");
    const storagePath = `${productId}/${contentHash.slice(0, 24)}.${ext}`;

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
  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  revalidatePath(`/admin/produits/${productId}`);
}
