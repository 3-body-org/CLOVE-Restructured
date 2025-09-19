# 🚀 Quick Google Drive Backup Setup

Follow these simple steps to set up automated database backups in 5 minutes!

## Step 1: Create Google Drive Folder (1 minute)

1. Go to [Google Drive](https://drive.google.com/)
2. Click "New" → "Folder"
3. Name it: `CLOVE Database Backups`
4. Right-click the folder → "Share" → "Advanced"
5. Change to "Anyone with the link can view"
6. **Copy the folder ID** from the URL (the long string after `/folders/`)

## Step 2: Create Google Service Account (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "CLOVE Backups"
3. Enable Google Drive API:
   - Go to "APIs & Services" → "Library"
   - Search "Google Drive API" → Enable
4. Create Service Account:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: `clove-backup-service`
   - Click "Create and Continue" → "Done"
5. Create Key:
   - Click on your service account
   - Go to "Keys" tab → "Add Key" → "Create new key"
   - Choose "JSON" → Download the file
   - **Keep this file secure!**

## Step 3: Share Folder with Service Account (1 minute)

1. Open the downloaded JSON file
2. Copy the `client_email` (looks like `clove-backup-service@your-project.iam.gserviceaccount.com`)
3. Go back to your Google Drive folder
4. Right-click → "Share"
5. Add the service account email
6. Give it "Editor" permissions
7. Click "Send"

## Step 4: Add GitHub Secrets (1 minute)

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these 3 secrets:

### Secret 1: DATABASE_URL
- Name: `DATABASE_URL`
- Value: Your Render database URL (from Render dashboard)

### Secret 2: GOOGLE_DRIVE_FOLDER_ID
- Name: `GOOGLE_DRIVE_FOLDER_ID`
- Value: The folder ID you copied in Step 1

### Secret 3: GOOGLE_SERVICE_ACCOUNT_KEY
- Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
- Value: The entire JSON file content from Step 2

## Step 5: Test the Backup (1 minute)

1. Go to your GitHub repository
2. Click "Actions" tab
3. Click "Database Backup" workflow
4. Click "Run workflow" → "Run workflow"
5. Watch it work! 🎉

## ✅ Done!

Your database will now be automatically backed up every day at 2 AM UTC to your Google Drive folder.

## 🔧 Need Help?

- **Backup failed?** Check the Actions logs for error messages
- **Can't find folder ID?** Look in the URL: `drive.google.com/drive/folders/FOLDER_ID_HERE`
- **Service account issues?** Make sure you shared the folder with the service account email

## 📱 View Your Backups

Just go to your Google Drive folder "CLOVE Database Backups" and you'll see all your backups there!

---

**Total setup time: 5 minutes** ⏱️  
**Monthly cost: $0** 💰  
**Storage: 15GB free** 📦
