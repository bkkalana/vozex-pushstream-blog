
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/session";
import { AdminPageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { addMenuItem,deleteMenuItem,updateMenuItem } from "./actions";
import { MenuBuilder } from "@/components/admin/navigation/menu-builder";

export default async function NavigationAdmin(){
  await requirePermission("navigation.view");
  const [menus,pages,categories,toolCats]=await Promise.all([
    prisma.menu.findMany({include:{items:{orderBy:{sortOrder:"asc"}}},orderBy:{key:"asc"}}),
    prisma.page.findMany({where:{status:"PUBLISHED",deletedAt:null},select:{id:true,title:true,slug:true},orderBy:{title:"asc"},take:100}),
    prisma.category.findMany({where:{archivedAt:null},select:{id:true,name:true,slug:true},orderBy:{name:"asc"},take:100}),
    prisma.aiToolCategory.findMany({select:{id:true,name:true,slug:true},orderBy:{name:"asc"},take:100}),
  ]);
  const allItems=menus.flatMap(m=>m.items);
  const parentOptions=allItems.filter(x=>!x.parentId);
  return <div className="space-y-6">
    <AdminPageHeader eyebrow="Appearance" title="Advanced Navigation Builder" description="Create, edit, nest and drag menu items. Public navigation updates through cache revalidation without code changes."/>
    <form action={addMenuItem} className="grid gap-3 rounded-2xl border bg-white p-5 lg:grid-cols-2">
      <label className="text-sm font-semibold">Menu<select name="menuKey" className="mt-1 min-h-12 w-full rounded-xl border px-3"><option value="header">Header</option><option value="mega">Mega menu</option><option value="footer">Footer</option></select></label>
      <label className="text-sm font-semibold">Type<select name="itemType" className="mt-1 min-h-12 w-full rounded-xl border px-3"><option value="custom">Custom URL</option><option value="page">Page</option><option value="category">Category</option><option value="ai_tool_category">AI Tool Category</option></select></label>
      <label className="text-sm font-semibold">Label<input name="label" required className="mt-1 min-h-12 w-full rounded-xl border px-3"/></label>
      <label className="text-sm font-semibold">URL<input name="url" required placeholder="/path or https://..." className="mt-1 min-h-12 w-full rounded-xl border px-3"/></label>
      <label className="text-sm font-semibold">Reference (optional)<select name="referenceId" className="mt-1 min-h-12 w-full rounded-xl border px-3"><option value="">None</option><optgroup label="Pages">{pages.map(x=><option key={x.id} value={x.id}>{x.title} · /{x.slug}</option>)}</optgroup><optgroup label="Categories">{categories.map(x=><option key={x.id} value={x.id}>{x.name} · /category/{x.slug}</option>)}</optgroup><optgroup label="AI Tool Categories">{toolCats.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</optgroup></select></label>
      <label className="text-sm font-semibold">Parent<select name="parentId" className="mt-1 min-h-12 w-full rounded-xl border px-3"><option value="">No parent</option>{parentOptions.map(x=><option value={x.id} key={x.id}>Under {x.label}</option>)}</select></label>
      <label className="text-sm font-semibold">CSS identifier<input name="cssIdentifier" placeholder="optional-id" className="mt-1 min-h-12 w-full rounded-xl border px-3"/></label>
      <div className="flex flex-wrap items-end gap-5 text-sm"><label className="inline-flex items-center gap-2"><input type="checkbox" name="external"/>External</label><label className="inline-flex items-center gap-2"><input type="checkbox" name="openInNewTab"/>New tab</label><label className="inline-flex items-center gap-2"><input type="checkbox" name="nofollow"/>nofollow</label><label className="inline-flex items-center gap-2"><input type="checkbox" name="sponsored"/>sponsored</label><Button type="submit">Add item</Button></div>
    </form>

    <div className="grid gap-5 xl:grid-cols-3">{["header","mega","footer"].map(key=>{const menu=menus.find(m=>m.key===key);return <MenuBuilder key={key} menuKey={key} initial={(menu?.items??[]).map(x=>({...x,cssIdentifier:x.cssIdentifier??null,itemType:x.itemType??null,referenceId:x.referenceId??null}))}/>})}</div>

    <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">Edit menu items</h2><div className="mt-4 grid gap-3 xl:grid-cols-2">{allItems.map(item=><form action={updateMenuItem} key={item.id} className="rounded-xl border p-4"><input type="hidden" name="id" value={item.id}/><div className="grid gap-3 sm:grid-cols-2"><input name="label" defaultValue={item.label} aria-label="Label" className="min-h-11 rounded-xl border px-3"/><input name="url" defaultValue={item.url} aria-label="URL" className="min-h-11 rounded-xl border px-3"/><input name="cssIdentifier" defaultValue={item.cssIdentifier??""} aria-label="CSS identifier" className="min-h-11 rounded-xl border px-3"/><div className="flex flex-wrap gap-3 text-xs"><label><input type="checkbox" name="external" defaultChecked={item.external}/> External</label><label><input type="checkbox" name="openInNewTab" defaultChecked={item.openInNewTab}/> New tab</label><label><input type="checkbox" name="nofollow" defaultChecked={item.nofollow}/> nofollow</label><label><input type="checkbox" name="sponsored" defaultChecked={item.sponsored}/> sponsored</label></div></div><div className="mt-3 flex justify-end gap-2"><Button type="submit" variant="secondary">Save</Button><button formAction={deleteMenuItem} className="min-h-12 rounded-xl bg-[var(--error)] px-4 text-sm font-semibold text-white">Delete</button></div></form>)}</div></section>
  </div>
}
