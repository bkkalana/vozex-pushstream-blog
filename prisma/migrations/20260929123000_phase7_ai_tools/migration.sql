ALTER TABLE `AiTool` ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0;
CREATE INDEX `AiTool_views_status_idx` ON `AiTool`(`views`, `status`);
CREATE INDEX `AiTool_updatedAt_status_idx` ON `AiTool`(`updatedAt`, `status`);
