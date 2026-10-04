
import { requirePermission } from "@/lib/auth/session";
import { AdminPageHeader } from "@/components/admin/shared/page-header";
import { ImportExportClient } from "@/components/admin/import-export/import-export-client";
export default async function ImportExportPage(){await requirePermission("imports.view");return <div><AdminPageHeader eyebrow="System" title="Import / Export" description="Validate and preview data before transactional import, or export operational datasets as CSV/JSON."/><ImportExportClient/></div>}
