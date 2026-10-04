CREATE TABLE `NewsletterSegment` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `NewsletterSegment_name_key`(`name`),
  UNIQUE INDEX `NewsletterSegment_slug_key`(`slug`),
  INDEX `NewsletterSegment_active_name_idx`(`active`,`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `NewsletterSubscriberSegment` (
  `subscriberId` VARCHAR(191) NOT NULL,
  `segmentId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `NewsletterSubscriberSegment_segmentId_createdAt_idx`(`segmentId`,`createdAt`),
  PRIMARY KEY (`subscriberId`,`segmentId`),
  CONSTRAINT `NewsletterSubscriberSegment_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `NewsletterSubscriber`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `NewsletterSubscriberSegment_segmentId_fkey` FOREIGN KEY (`segmentId`) REFERENCES `NewsletterSegment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EmailTemplate` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `textBody` LONGTEXT NOT NULL,
  `htmlBody` LONGTEXT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `EmailTemplate_key_key`(`key`),
  INDEX `EmailTemplate_active_name_idx`(`active`,`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ActivityLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `action` VARCHAR(120) NOT NULL,
  `entityType` VARCHAR(120) NULL,
  `entityId` VARCHAR(191) NULL,
  `summary` VARCHAR(500) NOT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `ActivityLog_createdAt_idx`(`createdAt`),
  INDEX `ActivityLog_userId_createdAt_idx`(`userId`,`createdAt`),
  INDEX `ActivityLog_entityType_entityId_idx`(`entityType`,`entityId`),
  INDEX `ActivityLog_action_createdAt_idx`(`action`,`createdAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
