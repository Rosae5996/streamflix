CREATE TABLE `ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`videoUrl` text,
	`imageUrl` text,
	`clickUrl` text,
	`duration` int NOT NULL DEFAULT 15,
	`isSkippable` boolean NOT NULL DEFAULT true,
	`skipAfter` int DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`parentId` int,
	`imageUrl` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`type` enum('movie','series') NOT NULL,
	`description` text,
	`shortDescription` text,
	`posterUrl` text,
	`backdropUrl` text,
	`trailerUrl` text,
	`releaseYear` int,
	`duration` int,
	`rating` varchar(16),
	`imdbRating` decimal(3,1),
	`categoryId` int,
	`tags` json DEFAULT ('[]'),
	`cast` json DEFAULT ('[]'),
	`director` varchar(256),
	`language` varchar(64) DEFAULT 'es',
	`country` varchar(64),
	`status` enum('published','draft','archived') NOT NULL DEFAULT 'draft',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isFree` boolean NOT NULL DEFAULT false,
	`minPlanId` int,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `content_ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adId` int NOT NULL,
	`contentId` int,
	`episodeId` int,
	`timestamp` int NOT NULL,
	`appliesTo` json DEFAULT ('["basic"]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_ads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seasonId` int NOT NULL,
	`contentId` int NOT NULL,
	`number` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`duration` int,
	`isFree` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `episodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`number` int NOT NULL,
	`title` varchar(256),
	`description` text,
	`posterUrl` text,
	`releaseYear` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`description` text,
	`priceUsd` decimal(10,2) NOT NULL,
	`priceMxn` decimal(10,2),
	`currency` varchar(8) NOT NULL DEFAULT 'USD',
	`billingCycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`features` json DEFAULT ('[]'),
	`maxQuality` enum('480p','720p','1080p','4K') NOT NULL DEFAULT '1080p',
	`hasAds` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`paypalPlanId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_plans_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subtitles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int,
	`episodeId` int,
	`language` varchar(64) NOT NULL,
	`languageCode` varchar(8) NOT NULL,
	`url` text NOT NULL,
	`fileKey` text,
	`format` varchar(16) DEFAULT 'vtt',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subtitles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('active','cancelled','expired','pending') NOT NULL DEFAULT 'pending',
	`paypalSubscriptionId` varchar(256),
	`paypalOrderId` varchar(256),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int,
	`episodeId` int,
	`quality` enum('360p','480p','720p','1080p','4K') NOT NULL,
	`url` text NOT NULL,
	`fileKey` text,
	`fileSize` int,
	`mimeType` varchar(64) DEFAULT 'video/mp4',
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watch_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`episodeId` int,
	`progressSeconds` int NOT NULL DEFAULT 0,
	`totalSeconds` int DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`watchedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watch_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;