import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { reviewService } from "@/services/reviews/review.service";
import { AdminPageHeader } from "@/components/admin/shared/page-header";
import { ReviewForm } from "@/components/admin/reviews/review-form";

function plain(doc: any) {
  return Array.isArray(doc?.content)
    ? doc.content
        .map((node: any) => Array.isArray(node.content)
          ? node.content.map((item: any) => item.text || "").join("")
          : "")
        .filter(Boolean)
        .join("\n\n")
    : "";
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("reviews.edit");
  const id = (await params).id;
  const [review, tools, media] = await Promise.all([
    reviewService.get(id),
    prisma.aiTool.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.media.findMany({ where: { deletedAt: null, mimeType: { startsWith: "image/" } }, select: { id: true, title: true, filename: true, path: true }, orderBy: { createdAt: "desc" }, take: 120 }),
  ]);
  if (!review) notFound();

  const ratings = Object.fromEntries(review.ratings.map((rating) => [rating.dimension, rating.score.toString()]));
  const initial = {
    id: review.id,
    title: review.title,
    slug: review.slug,
    aiToolId: review.aiToolId,
    contentText: plain(review.content),
    bestFor: review.bestFor,
    pricing: review.pricing,
    officialUrl: review.officialUrl,
    affiliateUrl: review.affiliateUrl,
    verdict: review.verdict,
    disclosureType: review.disclosureType,
    disclosureText: review.disclosureText,
    status: review.status,
    publishedAt: review.publishedAt?.toISOString(),
    ratings,
    faq: Array.isArray(review.faq) ? review.faq : [],
    pros: Array.isArray(review.pros) ? review.pros : [],
    cons: Array.isArray(review.cons) ? review.cons : [],
    alternatives: review.alternatives.map((item) => ({ name: item.name, url: item.url, note: item.note })),
    screenshots: review.screenshots.map((item) => ({ mediaId: item.mediaId })),
    products: review.products.map((product) => ({
      name: product.name,
      label: product.label,
      description: product.description,
      bestFor: product.bestFor,
      pricing: product.pricing,
      rating: product.rating?.toString() ?? "",
      pros: Array.isArray(product.pros) ? product.pros : [],
      cons: Array.isArray(product.cons) ? product.cons : [],
      productUrl: product.productUrl,
      affiliateUrl: product.affiliateUrl,
      mediaId: product.mediaId,
    })),
  };

  return (
    <div>
      <AdminPageHeader title={`Edit ${review.title}`} description="Update ratings, editorial content, ranked products, alternatives, FAQs and publication state." />
      <ReviewForm tools={tools} media={media} initial={initial} />
    </div>
  );
}
