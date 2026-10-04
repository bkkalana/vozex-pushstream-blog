ALTER TABLE `AiTool`
  ADD COLUMN `pricingVerifiedAt` DATETIME(3) NULL,
  ADD COLUMN `officialUrlVerifiedAt` DATETIME(3) NULL,
  ADD COLUMN `featuresVerifiedAt` DATETIME(3) NULL;

CREATE TABLE `AiToolChange` (
  `id` VARCHAR(191) NOT NULL,
  `aiToolId` VARCHAR(191) NOT NULL,
  `changedById` VARCHAR(191) NULL,
  `changeType` VARCHAR(80) NOT NULL,
  `summary` VARCHAR(500) NOT NULL,
  `changes` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AiToolChange_aiToolId_createdAt_idx` (`aiToolId`,`createdAt`),
  INDEX `AiToolChange_changedById_createdAt_idx` (`changedById`,`createdAt`),
  CONSTRAINT `AiToolChange_aiToolId_fkey` FOREIGN KEY (`aiToolId`) REFERENCES `AiTool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AiToolChange_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AiToolAlternative` (
  `id` VARCHAR(191) NOT NULL,
  `sourceToolId` VARCHAR(191) NOT NULL,
  `targetToolId` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `note` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AiToolAlternative_sourceToolId_targetToolId_key` (`sourceToolId`,`targetToolId`),
  INDEX `AiToolAlternative_sourceToolId_sortOrder_idx` (`sourceToolId`,`sortOrder`),
  INDEX `AiToolAlternative_targetToolId_idx` (`targetToolId`),
  CONSTRAINT `AiToolAlternative_sourceToolId_fkey` FOREIGN KEY (`sourceToolId`) REFERENCES `AiTool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AiToolAlternative_targetToolId_fkey` FOREIGN KEY (`targetToolId`) REFERENCES `AiTool`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ComparisonFeature`
  ADD COLUMN `valueC` TEXT NULL,
  ADD COLUMN `valueType` ENUM('TEXT','BOOLEAN','PRICING','RATING','BADGE') NOT NULL DEFAULT 'TEXT';
