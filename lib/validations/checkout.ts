import { z } from "zod";

export const checkoutFormSchema = z.object({
  guestName: z.string().trim().min(2, "Indiquez votre nom complet."),
  guestPhone: z
    .string()
    .trim()
    .min(8, "Indiquez un numéro de téléphone valide."),
  guestAddress: z.string().trim().min(5, "Indiquez une adresse ou un quartier de livraison."),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
