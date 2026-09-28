import { BannerManager } from "@/components/admin/banner-manager";
import { getAdminBanners } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-brand">Campañas</p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
          Banners de la home
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Prepara aquí las campañas de temporada y actívalas cuando toque. Se
          muestra un solo banner a la vez: al activar uno, el anterior se apaga.
          Si programas fechas, el banner solo aparece dentro de esa ventana.
        </p>
      </header>

      <BannerManager banners={banners} />
    </div>
  );
}
