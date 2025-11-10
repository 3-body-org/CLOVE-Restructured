# Database Backup Setup Guide

This guide will help you set up automated database backups for your CLOVE application using GitHub Actions and Google Drive.

## 🎯 What This Setup Provides

- ✅ **Automated daily backups** at 2 AM UTC
- ✅ **Manual backup triggers** via GitHub Actions
- ✅ **Multiple backup types**: Full, Schema-only, Data-only
- ✅ **Automatic compression** to save storage space
- ✅ **Automatic cleanup** of old backups (keeps 30 days)
- ✅ **Secure storage** in Google Drive
- ✅ **Easy restoration** from any backup
- ✅ **FREE** - No additional costs!

## 📋 Prerequisites

1. **Google Account** (free)
2. **GitHub Repository** (this one)
3. **Render Database** (your current PostgreSQL database)

## 🚀 Setup Steps

### Step 1: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called "CLOVE Database Backups"
3. Right-click the folder → "Share" → "Advanced"
4. Change access to "Anyone with the link can view" (for service account access)
5. Copy the folder ID from the URL (the long string after `/folders/`)

### Step 2: Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create Service Account:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: `clove-backup-service`
   - Description: `Service account for CLOVE database backups`
   - Click "Create and Continue"
   - Skip role assignment (click "Continue")
   - Click "Done"
5. Create Service Account Key:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the JSON file
   - **IMPORTANT**: Keep this file secure!

### Step 3: Share Folder with Service Account

1. Open the downloaded JSON file
2. Copy the `client_email` value (looks like `clove-backup-service@your-project.iam.gserviceaccount.com`)
3. Go back to your Google Drive folder
4. Right-click → "Share"
5. Add the service account email
6. Give it "Editor" permissions
7. Click "Send"

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add these secrets:

```
DATABASE_URL = postgresql+asyncpg://username:password@host:port/database
GOOGLE_DRIVE_FOLDER_ID = your_folder_id_here
GOOGLE_SERVICE_ACCOUNT_KEY = {"type":"service_account","project_id":"..."}
```

**To get your DATABASE_URL:**
- Go to your Render dashboard
- Click on your database
- Copy the "External Database URL"

**For GOOGLE_SERVICE_ACCOUNT_KEY:**
- Open the downloaded JSON file
- Copy the entire JSON content (including all the curly braces)
- Paste it as the secret value

### Step 5: Test the Setup

1. Go to your GitHub repository
2. Click "Actions" tab
3. Click "Database Backup" workflow
4. Click "Run workflow" → "Run workflow"
5. Watch the backup process in real-time

## 🔧 Usage

### Automatic Backups
- Runs daily at 2 AM UTC
- No action required from you
- Check the Actions tab to see backup history

### Manual Backups
1. Go to "Actions" → "Database Backup"
2. Click "Run workflow"
3. Choose backup type:
   - **Full**: Complete database backup
   - **Schema only**: Just table structures
   - **Data only**: Just data, no structures

### View Available Backups
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
python scripts/list_backups_gdrive.py --folder-id your_folder_id
```

### Restore from Backup
```bash
export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
python scripts/restore_backup_gdrive.py \
  --folder-id your_folder_id \
  --filename clove_db_backup_full_20241201_020000.sql.gz \
  --database-url your_database_url
```

## 📊 Monitoring

### Check Backup Status
- Go to GitHub Actions tab
- Look for "Database Backup" workflow runs
- Green checkmark = successful backup
- Red X = failed backup (check logs)

### Backup Storage
- Backups are stored in your Google Drive folder
- Files are compressed (`.sql.gz` format)
- Automatic cleanup after 30 days

## 🛠️ Troubleshooting

### Common Issues

**1. "Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY"**
- Make sure you copied the entire JSON file content
- Check that there are no extra spaces or characters

**2. "Database connection failed"**
- Verify DATABASE_URL is correct
- Check if database is accessible from GitHub Actions

**3. "Error uploading to Google Drive"**
- Check that the service account has access to the folder
- Verify the folder ID is correct
- Make sure Google Drive API is enabled

**4. "File not found" errors**
- Check that the service account email was added to the folder
- Verify the folder ID in your secrets

### Getting Help

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Test the service account access manually

## 🔒 Security Notes

- Database credentials are stored as encrypted GitHub secrets
- Google Drive folder is private (only you and service account can access)
- Service account has minimal required permissions
- Backups are stored securely in your personal Google Drive

## 💰 Cost

- **GitHub Actions**: Free (2,000 minutes/month)
- **Google Drive**: Free (15GB storage)
- **Google Cloud**: Free (service account usage)
- **Total**: $0/month! 🎉

## 🎉 You're All Set!

Your database will now be automatically backed up every day to your Google Drive. The backups are:
- ✅ Free
- ✅ Secure
- ✅ Compressed
- ✅ Automatically cleaned up
- ✅ Easy to restore
- ✅ Accessible from anywhere

If you need to restore your database, just use the restore script with any backup file from your Google Drive folder.
