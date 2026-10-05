/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { getPageDefinition, isPublicPageKey, PUBLIC_SECTION_TYPES } from "@/lib/site/page-section-registry";
import { pageSectionsService } from "@/services/site/page-sections.service";
import { AdminPageHeader } from "@/components/admin/shared/page-header";
import { SectionOrder } from "@/components/admin/site-pages/section-order";
import {
  ensurePageDefaultsAction,
  savePageSectionAction,
  addPageSectionItemAction,
  deletePageSectionItemAction,
  updatePageSectionItemAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { ManualItemPicker } from "@/components/admin/site-pages/manual-item-picker";
import { SectionMediaPicker } from "@/components/admin/site-pages/section-media-picker";
import { ItemOrderEditor } from "@/components/admin/site-pages/item-order-editor";
import { SectionActions } from "@/components/admin/site-pages/section-actions";
import { SectionSaveButton, ItemSaveButton } from "@/components/admin/site-pages/section-save-button";
import { DirtyEditorGuard } from "@/components/admin/site-pages/dirty-editor-guard";
import { PagePreview } from "@/components/admin/site-pages/page-preview";
import { FormFeedback } from "@/components/admin/site-pages/form-feedback";

const DATA_SOURCES = [
  ["manual", "Manual items"],
  ["latest_posts", "Latest posts"],
  ["trending_posts", "Trending posts"],
  ["featured_posts", "Featured posts"],
  ["featured_categories", "Featured categories"],
  ["featured_tools", "Featured tools"],
  ["latest_reviews", "Latest reviews"],
  ["authors", "Authors"],
  ["resources", "Resources"],
  ["all_tools", "All tools"],
] as const;

export default async function SitePageEditor({ params }: { params: Promise<{ pageKey: string }> }) {
  await requirePermission("sitePages.view");
  const { pageKey } = await params;
  if (!isPublicPageKey(pageKey)) notFound();

  const def = getPageDefinition(pageKey)!;
  const sections = await pageSectionsService.listAdmin(pageKey);
  const options = await pageSectionsService.dataOptions();
  const pickerOptions = [
    ...options.posts.map((x) => ({ id: x.id, label: x.title, type: "post" })),
    ...options.tools.map((x) => ({ id: x.id, label: x.name, type: "tool" })),
    ...options.reviews.map((x) => ({ id: x.id, label: x.title, type: "review" })),
    ...options.authors.map((x) => ({ id: x.id, label: x.user.name, type: "author" })),
    ...options.categories.map((x) => ({ id: x.id, label: x.name, type: "category" })),
  ];

  return (
    <div className="space-y-6" data-site-page-editor>
      <DirtyEditorGuard />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader eyebrow="Site Page" title={def.label} description={def.description} />
        <div className="flex gap-2">
          <Link href="/admin/site-pages" className="mt-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold">All pages</Link>
          <Link href={def.href} target="_blank" className="mt-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open page ↗</Link>
        </div>
      </div>

      <PagePreview href={def.href} />

      {sections.length === 0 ? (
        <form action={ensurePageDefaultsAction} className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <input type="hidden" name="pageKey" value={pageKey} />
          <h2 className="font-bold text-blue-950">Create default section structure</h2>
          <p className="mt-1 text-sm text-blue-800">This creates only page-layout records. Existing posts, tools, reviews and media are not changed.</p>
          <Button className="mt-4" type="submit">Create defaults</Button>
        </form>
      ) : (
        <SectionOrder pageKey={pageKey} initial={sections.map((s) => ({ id: s.id, label: s.heading ?? s.sectionKey, type: s.sectionType }))} />
      )}

      <div className="space-y-5">
        {sections.map((section) => {
          const config = (section.config as any) ?? {};
          return (
            <section key={section.id} className="rounded-2xl border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-600">{section.sectionKey}</div>
                  <h2 className="text-xl font-bold">{section.heading ?? section.sectionType}</h2>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{section.sectionType}</span>
                    <span className={`rounded-full px-2 py-1 ${section.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100"}`}>{section.enabled ? "Visible" : "Hidden"}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">Order {section.sortOrder}</span>
                  </div>
                </div>
                <SectionActions pageKey={pageKey} sectionId={section.id} sectionKey={section.sectionKey} canReset={def.defaults.some((item)=>item.sectionKey===section.sectionKey)} />
              </div>

              <form action={savePageSectionAction} className="p-5"><FormFeedback successMessage="Section saved"/>
                <input type="hidden" name="pageKey" value={pageKey} />
                <input type="hidden" name="sectionKey" value={section.sectionKey} />

                <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div><div className="text-sm font-semibold">Section visibility</div><div className="text-xs text-slate-500">Hide a section without deleting its content.</div></div>
                  <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="enabled" defaultChecked={section.enabled} /> Enabled</label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="text-sm font-semibold">Section type
                    <select name="sectionType" defaultValue={section.sectionType} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal">{PUBLIC_SECTION_TYPES.map((x) => <option key={x} value={x}>{x.replaceAll("_", " ")}</option>)}</select>
                  </label>
                  <label className="text-sm font-semibold">Eyebrow
                    <input name="eyebrow" defaultValue={config.eyebrow ?? ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" />
                  </label>
                  <label className="text-sm font-semibold">Heading
                    <input name="heading" defaultValue={section.heading ?? ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" />
                  </label>
                  <label className="text-sm font-semibold">Blue accent text <span className="text-xs font-normal text-slate-500">(hero)</span>
                    <input name="accentText" defaultValue={config.accentText ?? ""} placeholder="Better Solutions." className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" />
                  </label>
                  <label className="text-sm font-semibold lg:col-span-2">Description
                    <textarea name="description" defaultValue={section.description ?? ""} className="mt-1 min-h-28 w-full rounded-xl border p-3 font-normal" />
                  </label>
                  <div className="lg:col-span-2"><div className="mb-1 text-sm font-semibold">{section.sectionKey === "hero" ? "Desktop hero image" : "Section image"}</div><SectionMediaPicker items={options.media} value={section.imageId} /></div>
                  {section.sectionKey === "hero" ? <div className="lg:col-span-2 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 lg:grid-cols-2">
                    <div className="lg:col-span-2"><div className="mb-1 text-sm font-semibold">Mobile hero image <span className="font-normal text-slate-500">(optional)</span></div><SectionMediaPicker name="mobileImageId" items={options.media} value={typeof config.mobileImageId === "string" ? config.mobileImageId : null} /><p className="mt-1 text-xs text-slate-500">If empty, the desktop hero image is reused on mobile.</p></div>
                    <label className="text-sm font-semibold">Hero image alt text<input name="heroImageAlt" defaultValue={config.heroImageAlt ?? ""} placeholder="Describe the image for accessibility" className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label>
                    <label className="text-sm font-semibold">Overlay strength<input name="heroOverlay" type="number" min="0" max="80" defaultValue={typeof config.heroOverlay === "number" ? config.heroOverlay : 0} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">0 = none, 80 = strongest.</span></label>
                    <label className="text-sm font-semibold">Desktop image position<select name="heroImagePosition" defaultValue={config.heroImagePosition ?? "center"} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select></label>
                    <label className="text-sm font-semibold">Mobile image position<select name="heroMobileImagePosition" defaultValue={config.heroMobileImagePosition ?? config.heroImagePosition ?? "center"} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select></label>
                  </div> : null}
                  <label className="text-sm font-semibold">Data source
                    <select name="dataSource" defaultValue={section.dataSource ?? "manual"} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal">{DATA_SOURCES.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
                  </label>
                  <label className="text-sm font-semibold">Style preset
                    <select name="stylePreset" defaultValue={config.stylePreset ?? "white"} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal"><option value="white">White</option><option value="soft">Soft blue</option><option value="navy">Navy</option><option value="gradient">Gradient</option></select>
                  </label>
                  <label className="text-sm font-semibold">Primary CTA label<input name="primaryCtaLabel" defaultValue={config.primaryCtaLabel ?? ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Primary CTA URL<input name="primaryCtaUrl" defaultValue={config.primaryCtaUrl ?? ""} placeholder="/latest or https://…" className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Secondary CTA label<input name="secondaryCtaLabel" defaultValue={config.secondaryCtaLabel ?? ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Secondary CTA URL<input name="secondaryCtaUrl" defaultValue={config.secondaryCtaUrl ?? ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label>
                  <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Order<input name="sortOrder" type="number" defaultValue={section.sortOrder} min="0" className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label><label className="text-sm font-semibold">Items<input name="itemCount" type="number" defaultValue={section.itemCount ?? 6} min="1" max="50" className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label></div>
                  <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Visible from <span className="text-xs font-normal text-slate-500">(optional)</span><input name="visibleFrom" type="datetime-local" defaultValue={typeof config.visibleFrom === "string" ? config.visibleFrom.slice(0,16) : ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label><label className="text-sm font-semibold">Visible until <span className="text-xs font-normal text-slate-500">(optional)</span><input name="visibleUntil" type="datetime-local" defaultValue={typeof config.visibleUntil === "string" ? config.visibleUntil.slice(0,16) : ""} className="mt-1 min-h-11 w-full rounded-xl border px-3 font-normal" /></label></div>
                  {pageKey === "latest" && section.sectionKey === "articles" ? <div className="lg:col-span-2 rounded-xl border bg-slate-50 p-4"><div className="mb-2 text-sm font-bold">Blog sidebar modules</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" name="showSidebarTrending" defaultChecked={config.showSidebarTrending !== false}/> Trending</label><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" name="showSidebarCategories" defaultChecked={config.showSidebarCategories !== false}/> Categories</label><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" name="showSidebarNewsletter" defaultChecked={config.showSidebarNewsletter !== false}/> Newsletter</label><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" name="showSidebarTools" defaultChecked={config.showSidebarTools !== false}/> Featured tools</label></div></div> : null}
                  <label className="text-sm font-semibold lg:col-span-2">Manual content selection<div className="mt-1"><ManualItemPicker options={pickerOptions} initial={Array.isArray(config.manualSelection) ? config.manualSelection : []} /></div></label>
                </div>

                {section.sectionType === "stats_row" ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Stats entered here are editorial display values unless explicitly wired to measured analytics. Do not present unverified values as measured analytics.</p> : null}
                <div className="mt-5 flex justify-end"><SectionSaveButton /></div>
              </form>

              <div className="border-t p-5">
                <div className="mb-3"><h3 className="font-bold">Repeatable items</h3><p className="text-xs text-slate-500">Drag to reorder. Open fields below to edit stats, FAQs, values, contact methods, social cards and floating hero chips.</p></div>
                <ItemOrderEditor pageKey={pageKey} sectionId={section.id} initial={section.items.map((i)=>({id:i.id,title:i.title,subtitle:i.subtitle,url:i.url,body:i.body}))} />

                {section.items.length ? <div className="mb-5 grid gap-3">{section.items.map((item) => (
                  <details key={item.id} className="rounded-xl border bg-slate-50 p-3">
                    <summary className="cursor-pointer font-semibold">{item.title ?? item.itemKey ?? "Untitled item"}<span className="ml-2 text-xs font-normal text-slate-500">Edit item</span></summary>
                    <form action={updatePageSectionItemAction} className="mt-4 grid gap-3 md:grid-cols-2"><FormFeedback successMessage="Item saved"/>
                      <input type="hidden" name="pageKey" value={pageKey}/><input type="hidden" name="sectionId" value={section.id}/><input type="hidden" name="id" value={item.id}/>
                      <label className="text-xs font-semibold">Title<input name="title" defaultValue={item.title ?? ""} className="mt-1 min-h-10 w-full rounded-lg border px-3 font-normal"/></label>
                      <label className="text-xs font-semibold">Subtitle<input name="subtitle" defaultValue={item.subtitle ?? ""} className="mt-1 min-h-10 w-full rounded-lg border px-3 font-normal"/></label>
                      <label className="text-xs font-semibold md:col-span-2">Body<textarea name="body" defaultValue={item.body ?? ""} className="mt-1 min-h-20 w-full rounded-lg border p-3 font-normal"/></label>
                      <label className="text-xs font-semibold">Icon key<input name="icon" defaultValue={item.icon ?? ""} className="mt-1 min-h-10 w-full rounded-lg border px-3 font-normal"/></label>
                      <label className="text-xs font-semibold">URL<input name="url" defaultValue={item.url ?? ""} className="mt-1 min-h-10 w-full rounded-lg border px-3 font-normal"/></label>
                      <label className="text-xs font-semibold">Item key<input name="itemKey" defaultValue={item.itemKey ?? ""} className="mt-1 min-h-10 w-full rounded-lg border px-3 font-normal"/></label>
                      <label className="text-xs font-semibold">Order<input type="number" name="sortOrder" defaultValue={item.sortOrder} min="0" className="mt-1 min-h-10 w-full rounded-lg border px-3 font-normal"/></label>
                      <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" name="enabled" defaultChecked={item.enabled}/> Enabled</label>
                      <div className="md:col-span-2"><div className="mb-1 text-xs font-semibold">Item image</div><SectionMediaPicker items={options.media} value={item.imageId}/></div>
                      <div className="md:col-span-2 flex items-center justify-between gap-3"><ItemSaveButton/><button type="submit" formAction={deletePageSectionItemAction} name="id" value={item.id} className="min-h-9 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600">Delete item</button></div>
                    </form>
                  </details>
                ))}</div> : null}

                <form action={addPageSectionItemAction} className="grid gap-3 rounded-xl border border-dashed p-4 md:grid-cols-2"><FormFeedback successMessage="Item added"/>
                  <input type="hidden" name="pageKey" value={pageKey}/><input type="hidden" name="sectionId" value={section.id}/><input type="hidden" name="enabled" value="on"/>
                  <input name="title" placeholder="Item title" className="min-h-11 rounded-xl border px-3"/><input name="subtitle" placeholder="Subtitle / small label" className="min-h-11 rounded-xl border px-3"/><textarea name="body" placeholder="Short body" className="min-h-20 rounded-xl border p-3 md:col-span-2"/><input name="icon" placeholder="Icon key (optional)" className="min-h-11 rounded-xl border px-3"/><input name="url" placeholder="/path or https://…" className="min-h-11 rounded-xl border px-3"/><input name="itemKey" placeholder="Optional item key" className="min-h-11 rounded-xl border px-3"/><input type="number" name="sortOrder" defaultValue={(section.items.length+1)*10} min="0" className="min-h-11 rounded-xl border px-3"/><div className="md:col-span-2"><div className="mb-1 text-xs font-semibold">Optional image</div><SectionMediaPicker items={options.media}/></div><div className="md:col-span-2 flex justify-end"><ItemSaveButton label="Add item"/></div>
                </form>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
