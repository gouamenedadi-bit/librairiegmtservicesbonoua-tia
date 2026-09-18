import Link from "next/link";
import { XCircle } from "lucide-react";

export default function OrderFailedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <XCircle className="mx-auto text-red-500" size={56} />
      <h1 className="mt-4 text-2xl font-bold text-brand-navy">Paiement annulé ou échoué</h1>
      <p className="mt-2 text-black/60">
        Votre commande n&apos;a pas été payée. Vous pouvez réessayer depuis votre panier.
      </p>
      <Link
        href="/panier"
        className="mt-8 inline-block rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white"
      >
        Retour au panier
      </Link>
    </div>
  );
}
