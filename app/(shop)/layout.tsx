import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getCategoryNavGroups } from "@/lib/catalog/queries";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const navGroups = await getCategoryNavGroups();

  return (
    <>
      <SiteHeader librairie={navGroups.librairie} papeterie={navGroups.papeterie} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
