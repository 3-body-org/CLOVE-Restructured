# 🚀 Quick Google Drive Backup Setup (OAuth 2.0)

Follow these simple steps to set up automated database backups in 10 minutes!

## Step 1: Create Google Drive Folder (1 minute)

1. Go to [Google Drive](https://drive.google.com/)
2. Click "New" → "Folder"
3. Name it: `CLOVE Database Backups`
4. **Copy the folder ID** from the URL (the long string after `/folders/`)

## Step 2: Create OAuth 2.0 Credentials (3 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing project: "CLOVE Backups"
3. Enable Google Drive API:
   - Go to "APIs & Services" → "Library"
   - Search "Google Drive API" → Enable
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop application"
   - Name: `CLOVE Backup OAuth`
   - Click "Create"
5. Download the JSON file and save as `credentials.json`

## Step 3: Setup OAuth Authentication (3 minutes)

1. **Put `credentials.json` in the `scripts/` folder**
2. **Run the setup script:**
   ```bash
   cd scripts
   python setup_oauth.py
   ```
3. **This will open a browser** for you to authenticate with your Google account
4. **After authentication, you'll get a `token.json` file**

## Step 4: Add GitHub Secrets (2 minutes)

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these 3 secrets:

### Secret 1: DATABASE_URL
- Name: `DATABASE_URL`
- Value: Your Render database URL (from Render dashboard)

### Secret 2: GOOGLE_DRIVE_FOLDER_ID
- Name: `GOOGLE_DRIVE_FOLDER_ID`
- Value: The folder ID you copied in Step 1

### Secret 3: GOOGLE_OAUTH_CREDENTIALS
- Name: `GOOGLE_OAUTH_CREDENTIALS`
- Value: The entire contents of `token.json` file

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
- **OAuth issues?** Make sure you completed the browser authentication step

## 📱 View Your Backups

Just go to your Google Drive folder "CLOVE Database Backups" and you'll see all your backups there!

---

**Total setup time: 10 minutes** ⏱️  
**Monthly cost: $0** 💰  
**Storage: 15GB free** 📦
