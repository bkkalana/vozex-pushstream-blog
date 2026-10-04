"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const dims = ["OVERALL","EASE_OF_USE","FEATURES","PERFORMANCE","SUPPORT","VALUE_FOR_MONEY"] as const;
const split = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

type ReviewProductDraft = {
  name: string;
  label: string;
  description: string;
  bestFor: string;
  pricing: string;
  rating: string;
  prosText: string;
  consText: string;
  productUrl: string;
  affiliateUrl: string;
  mediaId: string;
};

type MediaOption = { id: string; title: string | null; filename: string; path: string };

function productDraft(value?: any): ReviewProductDraft {
  return {
    name: value?.name ?? "",
    label: value?.label ?? "",
    description: value?.description ?? "",
    bestFor: value?.bestFor ?? "",
    pricing: value?.pricing ?? "",
    rating: value?.rating?.toString?.() ?? value?.rating ?? "",
    prosText: Array.isArray(value?.pros) ? value.pros.join("\n") : "",
    consText: Array.isArray(value?.cons) ? value.cons.join("\n") : "",
    productUrl: value?.productUrl ?? "",
    affiliateUrl: value?.affiliateUrl ?? "",
    mediaId: value?.mediaId ?? "",
  };
}

export function ReviewForm({
  initial,
  tools,
  media = [],
}: {
  initial?: any;
  tools: { id: string; name: string }[];
  media?: MediaOption[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<ReviewProductDraft[]>(
    Array.isArray(initial?.products) ? initial.products.map(productDraft) : [],
  );

  function updateProduct(index: number, key: keyof ReviewProductDraft, value: string) {
    setProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const ratings = Object.fromEntries(dims.map((dimension) => [
      dimension,
      form.get(dimension) ? Number(form.get(dimension)) : null,
    ]));
    const faq = split(String(form.get("faq") || ""))
      .map((line) => {
        const [question = "", ...rest] = line.split("|");
        return { question: question.trim(), answer: rest.join("|").trim() };
      })
      .filter((item) => item.question && item.answer);
    const alternatives = split(String(form.get("alternatives") || ""))
      .map((line) => {
        const [name = "", url, note] = line.split("|");
        return {
          name: name.trim(),
          url: url?.trim() || null,
          affiliateUrl: null,
          note: note?.trim() || "",
          aiToolId: null,
        };
      })
      .filter((item) => item.name);

    const body = {
      title: form.get("title"),
      slug: form.get("slug"),
      aiToolId: form.get("aiToolId") || null,
      contentText: form.get("contentText"),
      bestFor: form.get("bestFor"),
      pricing: form.get("pricing"),
      officialUrl: form.get("officialUrl") || null,
      affiliateUrl: form.get("affiliateUrl") || null,
      verdict: form.get("verdict"),
      disclosureType: form.get("disclosureType"),
      disclosureText: form.get("disclosureText"),
      status: form.get("status"),
      publishedAt: form.get("publishedAt")
        ? new Date(String(form.get("publishedAt"))).toISOString()
        : null,
      ratings,
      pros: split(String(form.get("pros") || "")),
      cons: split(String(form.get("cons") || "")),
      faq,
      screenshotIds: Array.isArray(initial?.screenshots)
        ? initial.screenshots.map((item: any) => item.mediaId).filter(Boolean)
        : [],
      alternatives,
      products: products
        .filter((item) => item.name.trim())
        .map((item) => ({
          name: item.name.trim(),
          label: item.label.trim(),
          description: item.description.trim(),
          bestFor: item.bestFor.trim(),
          pricing: item.pricing.trim(),
          rating: item.rating ? Number(item.rating) : null,
          pros: split(item.prosText),
          cons: split(item.consText),
          productUrl: item.productUrl.trim() || null,
          affiliateUrl: item.affiliateUrl.trim() || null,
          mediaId: item.mediaId || null,
        })),
    };

    const response = await fetch(
      initial?.id ? `/api/admin/reviews/${initial.id}` : "/api/admin/reviews",
      {
        method: initial?.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const json = await response.json();
    setBusy(false);
    if (!response.ok) return toast.error(json.error?.message || "Could not save review");
    toast.success(initial?.id ? "Review updated" : "Review created");
    router.push("/admin/reviews");
    router.refresh();
  }

  const input = "min-h-12 w-full rounded-xl border px-3";
  const textarea = `${input} py-3`;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="space-y-4 rounded-2xl border bg-white p-5">
          <label className="block text-sm font-semibold">Title<input required name="title" defaultValue={initial?.title} className={input} /></label>
          <label className="block text-sm font-semibold">Slug<input name="slug" defaultValue={initial?.slug} className={input} /></label>
          <label className="block text-sm font-semibold">Review content<textarea required name="contentText" rows={14} defaultValue={initial?.contentText || ""} className={textarea} /></label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">Best For<textarea name="bestFor" rows={4} defaultValue={initial?.bestFor || ""} className={textarea} /></label>
            <label className="text-sm font-semibold">Pricing<textarea name="pricing" rows={4} defaultValue={initial?.pricing || ""} className={textarea} /></label>
            <label className="text-sm font-semibold">Pros<textarea name="pros" rows={6} defaultValue={(initial?.pros || []).join("\n")} className={textarea} /></label>
            <label className="text-sm font-semibold">Cons<textarea name="cons" rows={6} defaultValue={(initial?.cons || []).join("\n")} className={textarea} /></label>
          </div>

          <section className="rounded-2xl border bg-[var(--background-soft)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-extrabold">Ranked products / providers</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Optional. Use for roundup reviews such as “Best Hosting…”; leave empty for a single-product review.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setProducts((current) => [...current, productDraft()])}>
                <Plus size={16} /> Add product
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {products.map((product, index) => (
                <article key={index} className="rounded-xl border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <strong>#{index + 1} {product.name || "New product"}</strong>
                    <button type="button" onClick={() => setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Remove product ${index + 1}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-semibold">Product / provider name<input value={product.name} onChange={(e) => updateProduct(index, "name", e.target.value)} className={input} /></label>
                    <label className="text-xs font-semibold">Badge / label<input value={product.label} onChange={(e) => updateProduct(index, "label", e.target.value)} placeholder="Best overall" className={input} /></label>
                    <label className="text-xs font-semibold">Rating<input type="number" min="0" max="5" step="0.1" value={product.rating} onChange={(e) => updateProduct(index, "rating", e.target.value)} className={input} /></label>
                    <label className="text-xs font-semibold">Image<select value={product.mediaId} onChange={(e) => updateProduct(index, "mediaId", e.target.value)} className={input}><option value="">No image</option>{media.map((item) => <option key={item.id} value={item.id}>{item.title || item.filename}</option>)}</select></label>
                    <label className="text-xs font-semibold md:col-span-2">Description<textarea rows={3} value={product.description} onChange={(e) => updateProduct(index, "description", e.target.value)} className={textarea} /></label>
                    <label className="text-xs font-semibold">Best for<textarea rows={3} value={product.bestFor} onChange={(e) => updateProduct(index, "bestFor", e.target.value)} className={textarea} /></label>
                    <label className="text-xs font-semibold">Pricing<textarea rows={3} value={product.pricing} onChange={(e) => updateProduct(index, "pricing", e.target.value)} className={textarea} /></label>
                    <label className="text-xs font-semibold">Pros <span className="font-normal text-[var(--text-muted)]">one per line</span><textarea rows={5} value={product.prosText} onChange={(e) => updateProduct(index, "prosText", e.target.value)} className={textarea} /></label>
                    <label className="text-xs font-semibold">Cons <span className="font-normal text-[var(--text-muted)]">one per line</span><textarea rows={5} value={product.consText} onChange={(e) => updateProduct(index, "consText", e.target.value)} className={textarea} /></label>
                    <label className="text-xs font-semibold">Official URL<input type="url" value={product.productUrl} onChange={(e) => updateProduct(index, "productUrl", e.target.value)} className={input} /></label>
                    <label className="text-xs font-semibold">Affiliate URL<input type="url" value={product.affiliateUrl} onChange={(e) => updateProduct(index, "affiliateUrl", e.target.value)} className={input} /></label>
                  </div>
                </article>
              ))}
              {!products.length ? <p className="rounded-xl border border-dashed bg-white p-4 text-sm text-[var(--text-muted)]">No ranked products. This review will render as a standard single-product review.</p> : null}
            </div>
          </section>

          <label className="block text-sm font-semibold">FAQ <span className="font-normal text-[var(--text-muted)]">one per line: Question | Answer</span><textarea name="faq" rows={6} defaultValue={(initial?.faq || []).map((item: any) => `${item.question} | ${item.answer}`).join("\n")} className={textarea} /></label>
          <label className="block text-sm font-semibold">Alternatives <span className="font-normal text-[var(--text-muted)]">Name | URL | Note</span><textarea name="alternatives" rows={5} defaultValue={(initial?.alternatives || []).map((item: any) => `${item.name} | ${item.url || ""} | ${item.note || ""}`).join("\n")} className={textarea} /></label>
          <label className="block text-sm font-semibold">Verdict<textarea name="verdict" rows={6} defaultValue={initial?.verdict || ""} className={textarea} /></label>
        </section>

        <aside className="space-y-4 rounded-2xl border bg-white p-5">
          <label className="block text-sm font-semibold">AI Tool<select name="aiToolId" defaultValue={initial?.aiToolId || ""} className={input}><option value="">None</option>{tools.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="block text-sm font-semibold">Status<select name="status" defaultValue={initial?.status || "DRAFT"} className={input}>{["DRAFT","REVIEW","SCHEDULED","PUBLISHED","ARCHIVED"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="block text-sm font-semibold">Publish date<input type="datetime-local" name="publishedAt" defaultValue={initial?.publishedAt?.slice(0, 16) || ""} className={input} /></label>
          <label className="block text-sm font-semibold">Official URL<input type="url" name="officialUrl" defaultValue={initial?.officialUrl || ""} className={input} /></label>
          <label className="block text-sm font-semibold">Affiliate URL<input type="url" name="affiliateUrl" defaultValue={initial?.affiliateUrl || ""} className={input} /></label>
          <label className="block text-sm font-semibold">Disclosure type<select name="disclosureType" defaultValue={initial?.disclosureType || "INDEPENDENT_EDITORIAL"} className={input}>{["INDEPENDENT_EDITORIAL","AFFILIATE","SPONSORED","FREE_REVIEW_COPY"].map((item) => <option key={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
          <label className="block text-sm font-semibold">Disclosure text<textarea name="disclosureText" rows={4} defaultValue={initial?.disclosureText || ""} className={textarea} /></label>
          <h3 className="font-bold">Ratings</h3>
          {dims.map((dimension) => <label key={dimension} className="block text-sm font-semibold">{dimension.replaceAll("_", " ")}<input name={dimension} type="number" min="0" max="5" step="0.1" defaultValue={initial?.ratings?.[dimension] ?? ""} className={input} /></label>)}
        </aside>
      </div>
      <div className="flex justify-end"><Button disabled={busy}>{busy ? "Saving…" : "Save Review"}</Button></div>
    </form>
  );
}
