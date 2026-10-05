import { getIndexNowKey } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = await getIndexNowKey();
  if (!key) return new Response("IndexNow is not configured.", { status: 404, headers: { "cache-control": "no-store" } });
  return new Response(key, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
