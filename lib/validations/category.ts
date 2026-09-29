import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis."),
  slug: z
    .string()
    .trim()
    .min(2, "Le slug est requis.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets."),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
