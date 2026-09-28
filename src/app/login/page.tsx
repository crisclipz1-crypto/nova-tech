import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col justify-center px-5 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a la tienda
        </Link>

        <div className="mt-8">
          <p className="font-mono text-base font-medium tracking-[-0.02em]">
            {SITE.name}
            <sup className="ml-0.5 text-[9px] text-brand">®</sup>
          </p>
          <h1 className="mt-5 text-2xl font-medium tracking-[-0.03em]">
            Panel de administración
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo para el equipo de {SITE.name}.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl ?? "/admin"} />
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3" />
          Esta zona está protegida y registra los accesos.
        </p>
      </div>
    </main>
  );
}
