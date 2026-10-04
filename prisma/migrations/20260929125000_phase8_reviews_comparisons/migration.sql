ALTER TABLE `Review` ADD COLUMN `pros` JSON NULL, ADD COLUMN `cons` JSON NULL;
CREATE TABLE `ReviewScreenshot` (
  `id` VARCHAR(191) NOT NULL,
  `reviewId` VARCHAR(191) NOT NULL,
  `mediaId` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  UNIQUE INDEX `ReviewScreenshot_reviewId_mediaId_key`(`reviewId`, `mediaId`),
  INDEX `ReviewScreenshot_reviewId_sortOrder_idx`(`reviewId`, `sortOrder`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ReviewScreenshot_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReviewScreenshot_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `ReviewAlternative` (
  `id` VARCHAR(191) NOT NULL,
  `reviewId` VARCHAR(191) NOT NULL,
  `aiToolId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NULL,
  `affiliateUrl` VARCHAR(191) NULL,
  `note` TEXT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  INDEX `ReviewAlternative_reviewId_sortOrder_idx`(`reviewId`, `sortOrder`),
  INDEX `ReviewAlternative_aiToolId_idx`(`aiToolId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ReviewAlternative_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReviewAlternative_aiToolId_fkey` FOREIGN KEY (`aiToolId`) REFERENCES `AiTool`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
