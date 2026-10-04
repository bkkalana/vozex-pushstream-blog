CREATE TABLE `ReviewProduct` (
  `id` VARCHAR(191) NOT NULL,
  `reviewId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NULL,
  `description` TEXT NULL,
  `bestFor` TEXT NULL,
  `pricing` TEXT NULL,
  `rating` DECIMAL(3,2) NULL,
  `pros` JSON NULL,
  `cons` JSON NULL,
  `productUrl` VARCHAR(191) NULL,
  `affiliateUrl` VARCHAR(191) NULL,
  `mediaId` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ReviewProduct_reviewId_sortOrder_idx`(`reviewId`, `sortOrder`),
  INDEX `ReviewProduct_mediaId_idx`(`mediaId`),
  CONSTRAINT `ReviewProduct_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReviewProduct_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Review` ADD COLUMN `authorId` VARCHAR(191) NULL;
CREATE INDEX `Review_authorId_idx` ON `Review`(`authorId`);
ALTER TABLE `Review` ADD CONSTRAINT `Review_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
