import { MessageCircle } from "lucide-react";

import { getWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const link = getWhatsAppLink("Bonjour, je viens de la boutique en ligne TIA Librairie.");
  if (!link) return null; // NEXT_PUBLIC_WHATSAPP_NUMBER not configured yet

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110"
    >
      <MessageCircle size={28} />
    </a>
  );
}
