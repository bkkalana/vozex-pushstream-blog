CREATE TABLE `AiActivity` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `postId` VARCHAR(191) NULL,
  `actionType` VARCHAR(80) NOT NULL,
  `promptSummary` VARCHAR(500) NOT NULL,
  `provider` ENUM('OPENAI','ANTHROPIC','GEMINI','LOCAL') NOT NULL,
  `model` VARCHAR(160) NOT NULL,
  `inputChars` INTEGER NOT NULL DEFAULT 0,
  `outputChars` INTEGER NOT NULL DEFAULT 0,
  `outputTokens` INTEGER NULL,
  `acceptedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AiActivity_userId_createdAt_idx` (`userId`,`createdAt`),
  INDEX `AiActivity_postId_createdAt_idx` (`postId`,`createdAt`),
  INDEX `AiActivity_provider_createdAt_idx` (`provider`,`createdAt`),
  CONSTRAINT `AiActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AiActivity_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AiUsageDaily` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `date` DATE NOT NULL,
  `provider` ENUM('OPENAI','ANTHROPIC','GEMINI','LOCAL') NOT NULL,
  `requestCount` INTEGER NOT NULL DEFAULT 0,
  `outputTokens` INTEGER NOT NULL DEFAULT 0,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AiUsageDaily_userId_date_provider_key` (`userId`,`date`,`provider`),
  INDEX `AiUsageDaily_date_provider_idx` (`date`,`provider`),
  CONSTRAINT `AiUsageDaily_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
