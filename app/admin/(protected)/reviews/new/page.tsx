import { requirePermission } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/shared/page-header";
import { ReviewForm } from "@/components/admin/reviews/review-form";

export default async function Page() {
  await requirePermission("reviews.create");
  const [tools, media] = await Promise.all([
    prisma.aiTool.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.media.findMany({ where: { deletedAt: null, mimeType: { startsWith: "image/" } }, select: { id: true, title: true, filename: true, path: true }, orderBy: { createdAt: "desc" }, take: 120 }),
  ]);
  return (
    <div>
      <AdminPageHeader title="Add Review" description="Create a structured editorial review or optional ranked-product roundup. Ratings are manually entered editorial data and are never fabricated." />
      <ReviewForm tools={tools} media={media} />
    </div>
  );
}
