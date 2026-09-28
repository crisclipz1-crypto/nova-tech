import { ReviewManager } from "@/components/admin/review-manager";
import { getAdminReviews, getProductOptions } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reseñas" };

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([
    getAdminReviews(),
    getProductOptions(),
  ]);

  const approved = reviews.filter((review) => review.approved).length;
  const featured = reviews.filter((review) => review.featured).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-brand">Reputación</p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
          Reseñas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {reviews.length} en total · {approved} aprobadas · {featured} en la
          home
        </p>
      </header>

      <ReviewManager reviews={reviews} products={products} />
    </div>
  );
}
