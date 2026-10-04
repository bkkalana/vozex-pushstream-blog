ALTER TABLE `PostView` ADD COLUMN `deviceGroup` VARCHAR(20) NULL;
ALTER TABLE `DailyContentStat` ADD COLUMN `affiliateClicks` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `searchClicks` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `BackgroundJob` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('SCHEDULED_PUBLISH','ANALYTICS_AGGREGATE','MAINTENANCE','EMAIL','IMAGE_PROCESS','LINK_CHECK','AI_TASK') NOT NULL,
  `status` ENUM('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `payload` JSON NULL,
  `dedupeKey` VARCHAR(191) NULL,
  `priority` INTEGER NOT NULL DEFAULT 0,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `maxAttempts` INTEGER NOT NULL DEFAULT 5,
  `runAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lockedAt` DATETIME(3) NULL,
  `lockedBy` VARCHAR(120) NULL,
  `lastError` TEXT NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `BackgroundJob_dedupeKey_key`(`dedupeKey`),
  INDEX `BackgroundJob_status_runAt_priority_idx`(`status`,`runAt`,`priority`),
  INDEX `BackgroundJob_type_status_createdAt_idx`(`type`,`status`,`createdAt`),
  INDEX `BackgroundJob_lockedAt_idx`(`lockedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `JobAttempt` (
  `id` VARCHAR(191) NOT NULL,
  `jobId` VARCHAR(191) NOT NULL,
  `attempt` INTEGER NOT NULL,
  `workerId` VARCHAR(120) NOT NULL,
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `finishedAt` DATETIME(3) NULL,
  `succeeded` BOOLEAN NULL,
  `error` TEXT NULL,
  UNIQUE INDEX `JobAttempt_jobId_attempt_key`(`jobId`,`attempt`),
  INDEX `JobAttempt_startedAt_idx`(`startedAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `JobAttempt_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BackgroundJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
