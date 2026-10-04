-- Phase 19: SEO intelligence, broken links and 404 analytics
CREATE TABLE `BrokenLink` (
  `id` VARCHAR(191) NOT NULL,
  `sourcePostId` VARCHAR(191) NOT NULL,
  `url` TEXT NOT NULL,
  `urlHash` VARCHAR(64) NOT NULL,
  `linkText` VARCHAR(500) NULL,
  `httpStatus` INTEGER NULL,
  `ignoredAt` DATETIME(3) NULL,
  `lastCheckedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `BrokenLink_sourcePostId_urlHash_key`(`sourcePostId`, `urlHash`),
  INDEX `BrokenLink_ignoredAt_lastCheckedAt_idx`(`ignoredAt`, `lastCheckedAt`),
  INDEX `BrokenLink_sourcePostId_ignoredAt_idx`(`sourcePostId`, `ignoredAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `BrokenLink_sourcePostId_fkey` FOREIGN KEY (`sourcePostId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `NotFoundStat` (
  `id` VARCHAR(191) NOT NULL,
  `path` VARCHAR(600) NOT NULL,
  `referrer` VARCHAR(600) NULL,
  `count` INTEGER NOT NULL DEFAULT 1,
  `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `NotFoundStat_path_key`(`path`),
  INDEX `NotFoundStat_count_lastSeenAt_idx`(`count`, `lastSeenAt`),
  INDEX `NotFoundStat_lastSeenAt_idx`(`lastSeenAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
