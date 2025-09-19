#!/usr/bin/env python3
"""
Clean up old database backups from Google Drive
"""
import argparse
import os
import sys
import json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def get_drive_service():
    """
    Initialize Google Drive service using service account
    """
    try:
        # Get service account key from environment variable
        service_account_info = json.loads(os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY'))
        
        # Define the scopes
        scopes = ['https://www.googleapis.com/auth/drive.file']
        
        # Create credentials
        credentials = service_account.Credentials.from_service_account_info(
            service_account_info, scopes=scopes
        )
        
        # Build the service
        service = build('drive', 'v3', credentials=credentials)
        return service
        
    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY")
        return None
    except Exception as e:
        print(f"❌ Error initializing Google Drive service: {e}")
        return None

def cleanup_old_backups(folder_id, keep_days=30, service=None):
    """
    Delete backups older than specified days
    """
    try:
        # Calculate cutoff date
        cutoff_date = datetime.now() - timedelta(days=keep_days)
        print(f"🗑️  Cleaning up backups older than {cutoff_date.strftime('%Y-%m-%d')}")
        
        # List files in the folder
        query = f"'{folder_id}' in parents and name contains 'clove_db_backup'"
        results = service.files().list(
            q=query,
            fields="nextPageToken, files(id, name, createdTime, size)",
            orderBy="createdTime desc"
        ).execute()
        
        files = results.get('files', [])
        
        if not files:
            print("❌ No backup files found")
            return True
        
        deleted_count = 0
        total_size_deleted = 0
        
        for file in files:
            # Parse creation time
            created_time = datetime.fromisoformat(file['createdTime'].replace('Z', '+00:00'))
            
            # Check if file is older than cutoff
            if created_time < cutoff_date:
                try:
                    # Delete the file
                    service.files().delete(fileId=file['id']).execute()
                    deleted_count += 1
                    total_size_deleted += int(file.get('size', 0))
                    print(f"🗑️  Deleted: {file['name']} (created: {created_time.strftime('%Y-%m-%d %H:%M:%S')})")
                except HttpError as e:
                    print(f"❌ Error deleting {file['name']}: {e}")
        
        print(f"✅ Cleanup complete: {deleted_count} files deleted, {total_size_deleted:,} bytes freed")
        return True
        
    except HttpError as e:
        print(f"❌ Error accessing Google Drive: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Clean up old database backups from Google Drive')
    parser.add_argument('--folder-id', required=True, help='Google Drive folder ID')
    parser.add_argument('--keep-days', type=int, default=30, help='Number of days to keep backups')
    
    args = parser.parse_args()
    
    # Initialize Google Drive service
    service = get_drive_service()
    if not service:
        sys.exit(1)
    
    # Clean up old backups
    success = cleanup_old_backups(args.folder_id, args.keep_days, service)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
