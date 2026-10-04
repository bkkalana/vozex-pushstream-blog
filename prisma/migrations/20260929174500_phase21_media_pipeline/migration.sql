CREATE TABLE `MediaCollection` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `MediaCollection_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MediaCollectionItem` (
  `collectionId` VARCHAR(191) NOT NULL,
  `mediaId` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `MediaCollectionItem_mediaId_sortOrder_idx`(`mediaId`,`sortOrder`),
  PRIMARY KEY (`collectionId`,`mediaId`),
  CONSTRAINT `MediaCollectionItem_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `MediaCollection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MediaCollectionItem_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
