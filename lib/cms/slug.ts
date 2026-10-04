export function slugify(value: string): string {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}

export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>, excludeSlug?: string): Promise<string> {
  const root = slugify(base) || "untitled";
  if (root === excludeSlug || !(await exists(root))) return root;
  for (let index = 2; index < 10000; index += 1) {
    const candidate = `${root}-${index}`;
    if (candidate === excludeSlug || !(await exists(candidate))) return candidate;
  }
  throw new Error("Unable to allocate a unique slug.");
}
