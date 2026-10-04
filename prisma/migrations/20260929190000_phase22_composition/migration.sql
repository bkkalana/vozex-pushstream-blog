ALTER TABLE `MenuItem`
  ADD COLUMN `openInNewTab` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `nofollow` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `sponsored` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `cssIdentifier` VARCHAR(191) NULL,
  ADD COLUMN `itemType` VARCHAR(191) NULL,
  ADD COLUMN `referenceId` VARCHAR(191) NULL;

CREATE INDEX `MenuItem_itemType_referenceId_idx`
ON `MenuItem`(`itemType`, `referenceId`);
