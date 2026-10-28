import Link from "next/link";
import { XCircle } from "lucide-react";

export default function OrderFailedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-20">
      <span className="animate-fade-in-up mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
        <XCircle size={40} />
      </span>
      <h1
        style={{ animationDelay: "60ms" }}
        className="animate-fade-in-up mt-6 font-display text-5xl font-extrabold uppercase leading-[0.95] text-brand-navy"
      >
        Paiement non abouti
      </h1>
      <p className="mt-3 text-black/60">
        Le paiement Wave a été annulé ou a échoué, donc votre commande n&apos;est pas payée. Votre panier est
        toujours là : vous pouvez réessayer.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/panier"
          className="rounded-full bg-brand-green px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
        >
          Retour au panier
        </Link>
        <Link
          href="/"
          className="rounded-full border-2 border-brand-navy/20 px-7 py-2.5 text-sm font-bold text-brand-navy transition hover:bg-brand-navy/5"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
