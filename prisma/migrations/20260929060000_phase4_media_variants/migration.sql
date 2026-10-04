CREATE TABLE `MediaVariant` (
  `id` VARCHAR(191) NOT NULL,
  `mediaId` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(191) NOT NULL,
  `path` VARCHAR(191) NOT NULL,
  `width` INTEGER NOT NULL,
  `height` INTEGER NOT NULL,
  `size` BIGINT NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `MediaVariant_path_key`(`path`),
  UNIQUE INDEX `MediaVariant_mediaId_kind_key`(`mediaId`,`kind`),
  INDEX `MediaVariant_mediaId_idx`(`mediaId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `MediaVariant_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
