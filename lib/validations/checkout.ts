import { z } from "zod";

export const checkoutFormSchema = z.object({
  // Same limits as create_order() enforces in SQL (0013 migration) — checked
  // here too so the customer gets a clear message instead of a generic error.
  guestName: z.string().trim().min(2, "Indiquez votre nom complet.").max(120, "Nom trop long."),
  guestPhone: z
    .string()
    .trim()
    .max(30, "Indiquez un numéro de téléphone valide.")
    .refine((value) => value.replace(/\D/g, "").length >= 8, "Indiquez un numéro de téléphone valide."),
  guestAddress: z
    .string()
    .trim()
    .min(5, "Indiquez une adresse ou un quartier de livraison.")
    .max(300, "Adresse trop longue."),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
