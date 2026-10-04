import { prisma } from "@/lib/db/prisma";
import { getPageDefinition, type PublicPageKey } from "@/lib/site/page-section-registry";
import { getSettingsMap } from "@/services/system/settings.service";
import { isPublicSectionVisible } from "@/lib/site/section-visibility";

type MediaPreview = { id: string; path: string; altText: string | null; title: string | null };

type SectionItem = {
  id?: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  imageId: string | null;
  url: string | null;
  sortOrder: number;
  config: Record<string, unknown>;
};

export type EditorialPageSection = {
  id?: string;
  sectionKey: string;
  sectionType: string;
  heading: string | null;
  description: string | null;
  sortOrder: number;
  dataSource: string | null;
  itemCount: number | null;
  imageId: string | null;
  config: Record<string, unknown>;
  items: SectionItem[];
};

function objectConfig(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function fallbackSections(pageKey: PublicPageKey): EditorialPageSection[] {
  const definition = getPageDefinition(pageKey);
  if (!definition) return [];
  return definition.defaults.map((section, index) => ({
    sectionKey: section.sectionKey,
    sectionType: section.sectionType,
    heading: section.heading ?? null,
    description: section.description ?? null,
    sortOrder: (index + 1) * 10,
    dataSource: section.dataSource ?? null,
    itemCount: section.itemCount ?? null,
    imageId: null,
    config: {},
    items: [],
  }));
}

function manualSelection(section: EditorialPageSection | undefined) {
  const raw = section?.config.manualSelection;
  return Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === "string")
    : [];
}

export async function getEditorialPageData(pageKey: "about" | "contact") {
  const now = new Date();
  const rows = await prisma.publicPageSection.findMany({
    where: { pageKey, enabled: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      items: {
        where: { enabled: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const visibleRows = rows.filter((row) => isPublicSectionVisible(row.config, now));
  const sections: EditorialPageSection[] = rows.length
    ? visibleRows.map((row) => ({
        ...row,
        config: objectConfig(row.config),
        items: row.items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          body: item.body,
          icon: item.icon,
          imageId: item.imageId,
          url: item.url,
          sortOrder: item.sortOrder,
          config: objectConfig(item.config),
        })),
      }))
    : fallbackSections(pageKey);

  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));
  const imageIds = new Set<string>();
  for (const section of sections) {
    if (section.imageId) imageIds.add(section.imageId);
    for (const item of section.items) if (item.imageId) imageIds.add(item.imageId);
  }

  const teamSection = byKey.get("team");
  const teamSelection = manualSelection(teamSection);

  const [mediaRows, authors, categories, settings] = await Promise.all([
    imageIds.size
      ? prisma.media.findMany({
          where: { id: { in: [...imageIds] }, deletedAt: null },
          select: { id: true, path: true, altText: true, title: true },
        })
      : Promise.resolve([]),
    pageKey === "about"
      ? prisma.authorProfile.findMany({
          where: { user: { deletedAt: null, status: "ACTIVE" } },
          include: { user: true, expertise: { orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "asc" },
          take: 20,
        })
      : Promise.resolve([]),
    pageKey === "about"
      ? prisma.category.findMany({
          where: { archivedAt: null },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            _count: {
              select: {
                posts: {
                  where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
                },
              },
            },
          },
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
          take: 12,
        })
      : Promise.resolve([]),
    getSettingsMap(),
  ]);

  const media = new Map<string, MediaPreview>((mediaRows as MediaPreview[]).map((row) => [row.id, row]));
  const authorMap = new Map(authors.map((author) => [author.id, author]));
  const orderedAuthors = teamSelection.length
    ? teamSelection.map((id) => authorMap.get(id)).filter(Boolean)
    : authors;

  const setting = (key: string, fallback = "") => String(settings.get(key) ?? fallback);

  return {
    sections,
    section: (key: string) => byKey.get(key),
    media,
    authors: orderedAuthors,
    categories,
    settings: {
      siteName: setting("general.siteName", "PushStream"),
      tagline: setting("general.tagline", "Smarter Tech. Better Solutions."),
      adminEmail: setting("general.adminEmail"),
      facebook: setting("social.facebook"),
      twitter: setting("social.twitter"),
      linkedin: setting("social.linkedin"),
      youtube: setting("social.youtube"),
      instagram: setting("social.instagram"),
    },
  };
}
