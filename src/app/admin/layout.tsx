import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel NOVA TECH" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * El proxy ya impide llegar aquí sin sesión. Esta segunda comprobación cubre
 * el caso de que el `matcher` del proxy cambie o deje de cubrir alguna ruta:
 * el panel nunca debe renderizarse sin una sesión válida.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  const pendingOrders = await db.order.count({ where: { status: "PENDIENTE" } });

  return (
    <div className="min-h-dvh bg-background">
      <AdminNav user={session.user} pendingOrders={pendingOrders} />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
