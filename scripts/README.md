# Database Backup Scripts

This directory contains scripts for managing database backups with Google Drive using OAuth 2.0.

## Scripts Overview

### `setup_oauth.py`
Sets up OAuth 2.0 authentication for Google Drive access. Run this locally to generate the token.json file.

**Usage:**
```bash
python setup_oauth.py
```

### `upload_backup_oauth.py`
Uploads a database backup file to Google Drive using OAuth 2.0.

**Usage:**
```bash
python upload_backup_oauth.py --file backup.sql.gz --folder-id your_folder_id --filename backup.sql.gz
```

## Setup Process

### 1. Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Desktop application"
6. Download the JSON file and save as `credentials.json`

### 2. Run Setup Script
```bash
python setup_oauth.py
```

### 3. Add GitHub Secret
Add the contents of `token.json` as `GOOGLE_OAUTH_CREDENTIALS` in your GitHub repository secrets.

## Environment Variables

- `GOOGLE_OAUTH_CREDENTIALS`: Your OAuth 2.0 token JSON
- `DATABASE_URL`: Your PostgreSQL connection string

## Installation

```bash
pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2 psycopg2-binary
```

## Why OAuth 2.0?

- ✅ **FREE** - No additional costs
- ✅ **15GB storage** - Uses your personal Google Drive storage
- ✅ **Works with personal accounts** - No need for Google Workspace
- ✅ **Familiar interface** - Access backups like any Google Drive file
- ✅ **Secure** - Your personal Google account security
- ✅ **Reliable** - Google's infrastructure
