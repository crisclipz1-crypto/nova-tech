import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";

export const metadata: Metadata = {
  title: "Finalizar pedido",
  description: "Completa tus datos de entrega. Pagas en efectivo al recibir.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <Link
        href="/carrito"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al carrito
      </Link>

      <header className="mt-6 max-w-xl">
        <p className="eyebrow text-brand">Pago contra entrega</p>
        <h1 className="display-2 mt-3 text-balance">
          Último paso: ¿a dónde lo llevamos?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No pedimos tarjeta ni transferencia. Confirmamos por WhatsApp y pagas
          en efectivo cuando el mensajero te entregue el pedido.
        </p>
      </header>

      {/* En móvil el resumen va arriba (plegado) para que se vea el total
          antes de escribir; en escritorio pasa a la columna derecha. */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div className="order-2 lg:order-1">
          <CheckoutForm />
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}
