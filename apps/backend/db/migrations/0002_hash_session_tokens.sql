-- Sessions are now stored by the SHA-256 of their token. Existing rows hold raw tokens,
-- so they are removed (everyone logs in once more) before the column is renamed.
DELETE FROM "sessions";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "token" TO "token_hash";
