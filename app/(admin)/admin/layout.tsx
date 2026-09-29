import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      {/* min-w-0 (not overflow-x-hidden): a flex item's default min-width is
          `auto`, which is what actually stops a wide child (e.g. the
          products table) from forcing this column wider than the row — a
          plain `overflow-x-hidden` here achieves the same visual result but
          makes `main` a CSS "scroll container" (overflow != visible on any
          axis), which silently breaks `position: sticky` for every
          descendant, since sticky computes against the nearest scroll
          container, and this one never actually scrolls itself (the
          document does). Learned by watching a sticky filter bar on
          /admin/produits fail to stick until this was traced back here. */}
      <main className="min-w-0 flex-1 bg-black/[0.02] p-4 sm:p-6 lg:p-8">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
