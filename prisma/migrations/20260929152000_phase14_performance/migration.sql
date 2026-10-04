-- Phase 14: compound indexes for high-frequency public listing paths
CREATE INDEX `Post_status_deletedAt_publishedAt_idx` ON `Post`(`status`, `deletedAt`, `publishedAt`);
CREATE INDEX `Post_status_deletedAt_views_publishedAt_idx` ON `Post`(`status`, `deletedAt`, `views`, `publishedAt`);
CREATE INDEX `AiTool_status_deletedAt_updatedAt_idx` ON `AiTool`(`status`, `deletedAt`, `updatedAt`);
CREATE INDEX `AiTool_featured_status_deletedAt_idx` ON `AiTool`(`featured`, `status`, `deletedAt`);
