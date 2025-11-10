#!/usr/bin/env python3
"""
Cleanup script for old database backups in Google Drive.
This script removes backup files older than the specified number of days.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def load_oauth_credentials() -> Credentials:
    """Load OAuth credentials from token.json file."""
    try:
        with open('token.json', 'r') as f:
            token_data = json.load(f)
        
        # Create credentials object with scopes (must match token.json scope)
        SCOPES = ['https://www.googleapis.com/auth/drive.file']
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)
        
        # Refresh token if needed
        if creds.expired and creds.refresh_token:
            print("🔄 Token expired, refreshing...")
            creds.refresh(Request())
            # Save the refreshed token
            with open('token.json', 'w') as f:
                f.write(creds.to_json())
            print("✅ Token refreshed successfully!")
            
        return creds
    except FileNotFoundError:
        print("❌ Error: token.json file not found. Make sure OAuth credentials are set up.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading OAuth credentials: {e}")
        sys.exit(1)


def get_backup_files(service, folder_id: str) -> List[Dict[str, Any]]:
    """Get all backup files from the specified Google Drive folder."""
    try:
        # Query for files in the folder that match backup naming pattern
        query = f"'{folder_id}' in parents and name contains 'clove_db_backup' and name contains '.sql.gz'"
        
        results = service.files().list(
            q=query,
            fields="files(id, name, createdTime, size)",
            orderBy="createdTime desc"
        ).execute()
        
        files = results.get('files', [])
        print(f"📁 Found {len(files)} backup files in Google Drive folder")
        return files
        
    except HttpError as error:
        print(f"❌ Error accessing Google Drive: {error}")
        sys.exit(1)


def parse_backup_filename(filename: str) -> datetime:
    """Parse backup filename to extract timestamp."""
    try:
        # Expected format: clove_db_backup_{type}_{timestamp}.sql.gz
        # Extract timestamp part (format: YYYYMMDD_HHMMSS)
        parts = filename.replace('.sql.gz', '').split('_')
        if len(parts) >= 4:
            timestamp_str = f"{parts[-2]}_{parts[-1]}"  # Last two parts should be date and time
            return datetime.strptime(timestamp_str, '%Y%m%d_%H%M%S')
        else:
            # Fallback to file creation time if filename parsing fails
            return None
    except Exception as e:
        print(f"⚠️  Warning: Could not parse timestamp from filename '{filename}': {e}")
        return None


def cleanup_old_backups(service, folder_id: str, keep_days: int) -> None:
    """Delete backup files older than the specified number of days."""
    files = get_backup_files(service, folder_id)
    
    if not files:
        print("📭 No backup files found to clean up")
        return
    
    cutoff_date = datetime.now() - timedelta(days=keep_days)
    files_to_delete = []
    files_to_keep = []
    
    for file in files:
        filename = file['name']
        created_time = datetime.fromisoformat(file['createdTime'].replace('Z', '+00:00'))
        
        # Try to parse timestamp from filename first
        backup_time = parse_backup_filename(filename)
        if backup_time:
            file_time = backup_time
        else:
            # Fallback to file creation time
            file_time = created_time.replace(tzinfo=None)
        
        if file_time < cutoff_date:
            files_to_delete.append(file)
        else:
            files_to_keep.append(file)
    
    print(f"🗑️  Files to delete: {len(files_to_delete)}")
    print(f"💾 Files to keep: {len(files_to_keep)}")
    
    if not files_to_delete:
        print("✅ No old files to clean up")
        return
    
    # Show files that will be deleted
    print("\n📋 Files to be deleted:")
    for file in files_to_delete:
        size_mb = int(file.get('size', 0)) / (1024 * 1024)
        print(f"  - {file['name']} ({size_mb:.1f} MB)")
    
    # Delete old files
    deleted_count = 0
    total_size_freed = 0
    
    for file in files_to_delete:
        try:
            file_id = file['id']
            file_size = int(file.get('size', 0))
            
            service.files().delete(fileId=file_id).execute()
            deleted_count += 1
            total_size_freed += file_size
            
            print(f"🗑️  Deleted: {file['name']}")
            
        except HttpError as error:
            print(f"❌ Error deleting {file['name']}: {error}")
        except Exception as e:
            print(f"❌ Unexpected error deleting {file['name']}: {e}")
    
    # Summary
    total_size_mb = total_size_freed / (1024 * 1024)
    print(f"\n✅ Cleanup completed!")
    print(f"📊 Deleted {deleted_count} files")
    print(f"💾 Freed up {total_size_mb:.1f} MB of space")
    print(f"📅 Kept files newer than {cutoff_date.strftime('%Y-%m-%d %H:%M:%S')}")


def main():
    parser = argparse.ArgumentParser(description='Clean up old database backups from Google Drive')
    parser.add_argument('--folder-id', required=True, help='Google Drive folder ID containing backups')
    parser.add_argument('--keep-days', type=int, default=30, help='Number of days to keep backups (default: 30)')
    
    args = parser.parse_args()
    
    print("🧹 Starting Google Drive backup cleanup...")
    print(f"📁 Folder ID: {args.folder_id}")
    print(f"📅 Keeping files newer than {args.keep_days} days")
    
    # Load OAuth credentials
    creds = load_oauth_credentials()
    
    # Build Google Drive service
    try:
        service = build('drive', 'v3', credentials=creds)
        print("✅ Connected to Google Drive API")
    except Exception as e:
        print(f"❌ Error connecting to Google Drive API: {e}")
        sys.exit(1)
    
    # Perform cleanup
    cleanup_old_backups(service, args.folder_id, args.keep_days)


if __name__ == '__main__':
    main()
