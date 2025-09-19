# Database Backup Scripts

This directory contains scripts for managing database backups with Google Drive.

## Scripts Overview

### `upload_backup_gdrive.py`
Uploads a database backup file to Google Drive.

**Usage:**
```bash
python upload_backup_gdrive.py --file backup.sql.gz --folder-id your_folder_id --filename backup.sql.gz
```

### `cleanup_old_backups_gdrive.py`
Removes old backup files from Google Drive to save storage space.

**Usage:**
```bash
python cleanup_old_backups_gdrive.py --folder-id your_folder_id --keep-days 30
```

### `restore_backup_gdrive.py`
Downloads and restores a database from a Google Drive backup.

**Usage:**
```bash
python restore_backup_gdrive.py --folder-id your_folder_id --filename backup.sql.gz --database-url postgresql://...
```

### `list_backups_gdrive.py`
Lists all available backups in Google Drive.

**Usage:**
```bash
python list_backups_gdrive.py --folder-id your_folder_id
```

## Environment Variables

- `GOOGLE_SERVICE_ACCOUNT_KEY`: Your Google service account JSON key
- `DATABASE_URL`: Your PostgreSQL connection string (for restore script)

## Installation

```bash
pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2 psycopg2-binary
```

## Examples

### List all backups
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
python list_backups_gdrive.py --folder-id your_folder_id
```

### Restore latest backup
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
export DATABASE_URL="postgresql://user:pass@host:port/db"
python restore_backup_gdrive.py \
  --folder-id your_folder_id \
  --filename clove_db_backup_full_20241201_020000.sql.gz \
  --database-url "$DATABASE_URL"
```

### Manual backup upload
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
pg_dump $DATABASE_URL | gzip > backup.sql.gz
python upload_backup_gdrive.py \
  --file backup.sql.gz \
  --folder-id your_folder_id \
  --filename manual_backup.sql.gz
```

## Why Google Drive?

- ✅ **FREE** - No additional costs
- ✅ **15GB storage** - Plenty for database backups
- ✅ **Easy setup** - No complex AWS configuration
- ✅ **Familiar interface** - Access backups like any Google Drive file
- ✅ **Secure** - Your personal Google account security
- ✅ **Reliable** - Google's infrastructure
