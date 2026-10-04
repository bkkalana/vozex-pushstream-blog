ALTER TABLE `Post`
  ADD COLUMN `tutorialDifficulty` VARCHAR(32) NULL,
  ADD COLUMN `tutorialEstimatedMinutes` INT NULL,
  ADD COLUMN `tutorialRequirements` TEXT NULL,
  ADD COLUMN `tutorialToolsNeeded` TEXT NULL,
  ADD COLUMN `tutorialPrerequisites` TEXT NULL;
