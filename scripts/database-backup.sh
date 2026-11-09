#!/bin/bash
# Saves a compressed database backup and deletes backups older than 14 days.
# Usage: database-backup.sh <staging|production> <backup folder>
set -euo pipefail

ENVIRONMENT="${1:?Usage: database-backup.sh <staging|production> <backup folder>}"
BACKUP_DIR="${2:?Usage: database-backup.sh <staging|production> <backup folder>}"
BACKUP_FILE="$BACKUP_DIR/pagewise-$(date +%Y-%m-%d_%H%M%S).sql.gz"

mkdir -p "$BACKUP_DIR"

# Write to a temporary name first, so a failed backup never looks like a finished one.
docker exec "pagewise-$ENVIRONMENT-postgres" \
  pg_dump --clean --if-exists -U pagewise pagewise | gzip > "$BACKUP_FILE.tmp"
mv "$BACKUP_FILE.tmp" "$BACKUP_FILE"

find "$BACKUP_DIR" -name 'pagewise-*.sql.gz' -mtime +14 -delete

echo "Backup saved: $BACKUP_FILE"
