import Link from "next/link";
import { Phone } from "lucide-react";

import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { getWhatsAppDisplayNumber, getWhatsAppLink } from "@/lib/whatsapp";

export async function SiteFooter() {
  const dict = getDictionary(await getLocale());
  const whatsappDisplayNumber = getWhatsAppDisplayNumber();
  const whatsappLink = getWhatsAppLink();

  return (
    <footer className="mt-auto bg-brand-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">TIA Librairie</p>
          <p className="mt-2 text-sm text-white/70">{dict.footer.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-gold">{dict.footer.boutique}</p>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li><Link href="/categorie/librairie-litterature" className="hover:text-white">{dict.footer.librairie}</Link></li>
            <li><Link href="/categorie/papeterie-bureau" className="hover:text-white">{dict.footer.papeterie}</Link></li>
            <li><Link href="/panier" className="hover:text-white">{dict.footer.monPanier}</Link></li>
            <li><Link href="/compte/inscription" className="hover:text-white">{dict.footer.inscription}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-gold">{dict.footer.contact}</p>
          <p className="mt-2 text-sm text-white/70">{dict.footer.address}</p>
          {whatsappDisplayNumber && whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
            >
              <Phone size={14} className="shrink-0 text-brand-green" />
              {whatsappDisplayNumber}
            </a>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 border-t border-white/10 py-4 text-center text-xs text-white/50 sm:flex-row sm:justify-center sm:gap-3">
        <span>
          © {new Date().getFullYear()} TIA Librairie — GMT Services Bonoua. {dict.footer.rights}
        </span>
        <Link href="/login" className="text-white/30 hover:text-white/60">
          Administration
        </Link>
      </div>
    </footer>
  );
}
