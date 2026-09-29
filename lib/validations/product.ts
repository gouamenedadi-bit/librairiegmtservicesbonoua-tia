import { z } from "zod";

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom est requis."),
    description: z.string().trim().optional(),
    categoryId: z.string().uuid("Choisissez une catégorie."),
    isOnRequest: z.boolean(),
    price: z.union([z.number().int().min(0), z.null()]),
    isActive: z.boolean(),
    variantLabel: z.string().trim().optional(),
  })
  .refine((data) => data.isOnRequest || data.price !== null, {
    message: "Indiquez un prix, ou cochez « prix sur demande ».",
    path: ["price"],
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
