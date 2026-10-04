ALTER TABLE `Post`
  ADD COLUMN `sponsorName` VARCHAR(191) NULL,
  ADD COLUMN `sponsorUrl` VARCHAR(191) NULL,
  ADD COLUMN `sponsorDisclosureText` TEXT NULL;

ALTER TABLE `Review`
  ADD COLUMN `disclosureType` ENUM('AFFILIATE','SPONSORED','FREE_REVIEW_COPY','INDEPENDENT_EDITORIAL') NOT NULL DEFAULT 'INDEPENDENT_EDITORIAL',
  ADD COLUMN `disclosureText` TEXT NULL;

ALTER TABLE `AffiliateClick`
  ADD COLUMN `sourcePage` VARCHAR(500) NULL,
  ADD COLUMN `sourcePostId` VARCHAR(191) NULL,
  ADD INDEX `AffiliateClick_sourcePostId_createdAt_idx` (`sourcePostId`,`createdAt`),
  ADD INDEX `AffiliateClick_sourcePage_createdAt_idx` (`sourcePage`,`createdAt`),
  ADD CONSTRAINT `AffiliateClick_sourcePostId_fkey` FOREIGN KEY (`sourcePostId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `AdSlot`
  ADD COLUMN `desktopEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN `tabletEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN `mobileEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN `startAt` DATETIME(3) NULL,
  ADD COLUMN `endAt` DATETIME(3) NULL,
  ADD COLUMN `targetCategoryId` VARCHAR(191) NULL,
  ADD COLUMN `targetArticleType` VARCHAR(80) NULL,
  ADD INDEX `AdSlot_enabled_startAt_endAt_idx` (`enabled`,`startAt`,`endAt`),
  ADD INDEX `AdSlot_targetCategoryId_idx` (`targetCategoryId`);
