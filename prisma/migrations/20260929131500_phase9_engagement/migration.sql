ALTER TABLE `ContactMessage` ADD COLUMN `ipHash` VARCHAR(191) NULL, ADD COLUMN `userAgent` VARCHAR(500) NULL;
CREATE TABLE `NewsletterToken` (
  `id` VARCHAR(191) NOT NULL, `subscriberId` VARCHAR(191) NOT NULL, `tokenHash` VARCHAR(191) NOT NULL,
  `purpose` ENUM('CONFIRM','UNSUBSCRIBE') NOT NULL, `expiresAt` DATETIME(3) NOT NULL, `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `NewsletterToken_tokenHash_key`(`tokenHash`), INDEX `NewsletterToken_subscriberId_purpose_expiresAt_idx`(`subscriberId`,`purpose`,`expiresAt`),
  PRIMARY KEY (`id`), CONSTRAINT `NewsletterToken_subscriberId_fkey` FOREIGN KEY (`subscriberId`) REFERENCES `NewsletterSubscriber`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `EngagementAttempt` (
  `id` VARCHAR(191) NOT NULL, `scope` VARCHAR(191) NOT NULL, `ipHash` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `EngagementAttempt_scope_ipHash_createdAt_idx`(`scope`,`ipHash`,`createdAt`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
