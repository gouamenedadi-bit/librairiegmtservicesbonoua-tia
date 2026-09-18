import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">TIA Librairie</p>
          <p className="mt-2 text-sm text-white/70">
            GMT Services Bonoua — librairie et papeterie, en boutique et en ligne.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-gold">Boutique</p>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li><Link href="/categorie/librairie" className="hover:text-white">Librairie</Link></li>
            <li><Link href="/categorie/papeterie" className="hover:text-white">Papeterie</Link></li>
            <li><Link href="/panier" className="hover:text-white">Mon panier</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-gold">Contact</p>
          <p className="mt-2 text-sm text-white/70">Bonoua, Côte d&apos;Ivoire</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} TIA Librairie — GMT Services Bonoua. Tous droits réservés.
      </div>
    </footer>
  );
}
