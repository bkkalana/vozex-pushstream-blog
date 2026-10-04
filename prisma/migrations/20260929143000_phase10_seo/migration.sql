ALTER TABLE `SeoMeta` MODIFY COLUMN `entityType` ENUM('POST','PAGE','CATEGORY','TAG','AUTHOR','AI_TOOL','REVIEW','COMPARISON') NOT NULL;

ALTER TABLE `SeoMeta`
  ADD COLUMN `twitterTitle` VARCHAR(191) NULL,
  ADD COLUMN `twitterDescription` TEXT NULL,
  ADD COLUMN `twitterImageUrl` VARCHAR(191) NULL;

ALTER TABLE `Redirect`
  ADD COLUMN `hits` BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN `lastHitAt` DATETIME(3) NULL;

CREATE INDEX `Redirect_active_updatedAt_idx` ON `Redirect`(`active`, `updatedAt`);
