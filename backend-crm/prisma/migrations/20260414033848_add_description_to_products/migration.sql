-- AlterTable
ALTER TABLE `customers` ADD COLUMN `isPaid` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `description` TEXT NULL;
