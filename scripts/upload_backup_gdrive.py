#!/usr/bin/env python3
"""
Upload database backup to Google Drive
"""
import argparse
import os
import sys
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
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

def upload_to_drive(file_path, folder_id, filename, service):
    """
    Upload a file to Google Drive folder
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ Error: File {file_path} does not exist")
            return False
            
        # Get file size
        file_size = os.path.getsize(file_path)
        print(f"📁 Uploading {file_path} ({file_size:,} bytes) to Google Drive")
        
        # Create file metadata
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        # Create media upload
        media = MediaFileUpload(
            file_path,
            mimetype='application/gzip',
            resumable=True
        )
        
        # Upload file
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,name,size,createdTime'
        ).execute()
        
        print(f"✅ Successfully uploaded to Google Drive")
        print(f"📄 File ID: {file.get('id')}")
        print(f"📁 Name: {file.get('name')}")
        print(f"📊 Size: {file.get('size')} bytes")
        print(f"🕒 Created: {file.get('createdTime')}")
        
        return True
        
    except HttpError as e:
        print(f"❌ Error uploading to Google Drive: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Upload database backup to Google Drive')
    parser.add_argument('--file', required=True, help='Path to backup file')
    parser.add_argument('--folder-id', required=True, help='Google Drive folder ID')
    parser.add_argument('--filename', required=True, help='Filename in Google Drive')
    
    args = parser.parse_args()
    
    # Initialize Google Drive service
    service = get_drive_service()
    if not service:
        sys.exit(1)
    
    # Upload file
    success = upload_to_drive(args.file, args.folder_id, args.filename, service)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
