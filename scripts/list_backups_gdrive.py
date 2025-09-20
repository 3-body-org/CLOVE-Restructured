#!/usr/bin/env python3
"""
List available database backups in Google Drive
"""
import argparse
import os
import sys
import json
from datetime import datetime
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
        scopes = ['https://www.googleapis.com/auth/drive']
        
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

def list_backups(folder_id, service=None, limit=50):
    """
    List database backups in Google Drive
    """
    try:
        print(f"📋 Listing backups in Google Drive folder: {folder_id}")
        print("=" * 80)
        
        # List files in the folder
        query = f"'{folder_id}' in parents and name contains 'clove_db_backup'"
        results = service.files().list(
            q=query,
            fields="nextPageToken, files(id, name, createdTime, size, webViewLink)",
            orderBy="createdTime desc"
        ).execute()
        
        files = results.get('files', [])
        
        if not files:
            print("❌ No backups found")
            return True
        
        # Limit results
        files = files[:limit]
        
        print(f"{'Filename':<50} {'Size':<12} {'Created':<20} {'Type'}")
        print("-" * 80)
        
        for file in files:
            filename = file['name']
            size = format_size(int(file.get('size', 0)))
            created = datetime.fromisoformat(file['createdTime'].replace('Z', '+00:00'))
            created_str = created.strftime('%Y-%m-%d %H:%M:%S')
            
            # Determine backup type from filename
            backup_type = "Unknown"
            if "full" in filename:
                backup_type = "Full"
            elif "schema" in filename:
                backup_type = "Schema"
            elif "data" in filename:
                backup_type = "Data"
            
            print(f"{filename:<50} {size:<12} {created_str:<20} {backup_type}")
        
        print(f"\n📊 Total: {len(files)} backups")
        return True
        
    except HttpError as e:
        print(f"❌ Error accessing Google Drive: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def format_size(size_bytes):
    """
    Format file size in human readable format
    """
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def main():
    parser = argparse.ArgumentParser(description='List database backups in Google Drive')
    parser.add_argument('--folder-id', required=True, help='Google Drive folder ID')
    parser.add_argument('--limit', type=int, default=50, help='Maximum number of backups to show')
    
    args = parser.parse_args()
    
    # Initialize Google Drive service
    service = get_drive_service()
    if not service:
        sys.exit(1)
    
    # List backups
    success = list_backups(args.folder_id, service, args.limit)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
