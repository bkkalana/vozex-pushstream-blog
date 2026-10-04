-- Phase 20: reusable content blocks + trash consistency
ALTER TABLE `Review` ADD COLUMN `deletedAt` DATETIME(3) NULL;
ALTER TABLE `Comparison` ADD COLUMN `deletedAt` DATETIME(3) NULL;
CREATE INDEX `Review_deletedAt_idx` ON `Review`(`deletedAt`);
CREATE INDEX `Comparison_deletedAt_idx` ON `Comparison`(`deletedAt`);

CREATE TABLE `ContentBlock` (
 `id` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `slug` VARCHAR(191) NOT NULL,
 `type` ENUM('NEWSLETTER_CTA','AFFILIATE_DISCLOSURE','AUTHOR_NOTE','PRODUCT_CTA','HOSTING_RECOMMENDATION','IMPORTANT_WARNING','STANDARD_DISCLAIMER','AD_PLACEHOLDER','CUSTOM') NOT NULL DEFAULT 'CUSTOM',
 `content` JSON NOT NULL, `status` ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
 `createdById` VARCHAR(191) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
 PRIMARY KEY (`id`), UNIQUE INDEX `ContentBlock_slug_key`(`slug`), INDEX `ContentBlock_status_type_updatedAt_idx`(`status`,`type`,`updatedAt`), INDEX `ContentBlock_createdById_idx`(`createdById`),
 CONSTRAINT `ContentBlock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ContentBlockUsage` (
 `id` VARCHAR(191) NOT NULL, `blockId` VARCHAR(191) NOT NULL, `postId` VARCHAR(191) NOT NULL,
 `mode` ENUM('SHARED','STATIC') NOT NULL DEFAULT 'SHARED', `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY (`id`), UNIQUE INDEX `ContentBlockUsage_blockId_postId_mode_key`(`blockId`,`postId`,`mode`), INDEX `ContentBlockUsage_postId_mode_idx`(`postId`,`mode`),
 CONSTRAINT `ContentBlockUsage_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `ContentBlock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `ContentBlockUsage_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
