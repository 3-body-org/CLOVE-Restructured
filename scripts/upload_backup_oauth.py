#!/usr/bin/env python3
"""
Upload database backup to Google Drive using OAuth 2.0
"""
import argparse
import os
import sys
import json
from datetime import datetime
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

# Scopes for Google Drive access (must match token.json scope)
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_drive_service():
    """
    Initialize Google Drive service using OAuth 2.0
    """
    try:
        # For GitHub Actions, we'll use a pre-authorized token
        # This requires manual setup but works in CI/CD
        token_file = 'token.json'
        
        if not os.path.exists(token_file):
            print("❌ Error: token.json not found. Please run the setup script first.")
            return None
        
        # Load credentials from token file
        with open(token_file, 'r') as f:
            token_data = json.load(f)
        
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)
        
        # Check if token is expired and refresh if needed
        if creds.expired and creds.refresh_token:
            print("🔄 Token expired, refreshing...")
            try:
                creds.refresh(Request())
                # Save the refreshed token
                with open(token_file, 'w') as token:
                    token.write(creds.to_json())
                print("✅ Token refreshed successfully!")
            except Exception as e:
                print(f"❌ Error refreshing token: {e}")
                print("💡 You may need to re-run the setup script to get a new token.")
                return None
        
        # Build the service
        service = build('drive', 'v3', credentials=creds)
        return service
        
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
        if e.resp.status == 401:
            print("❌ Authentication error: Token may be expired or invalid")
            print("💡 Please re-run the setup script to get a new token")
        else:
            print(f"❌ Google Drive API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Upload database backup to Google Drive using OAuth 2.0')
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
