#!/usr/bin/env python3
"""
Restore database from Google Drive backup
"""
import argparse
import os
import sys
import json
import subprocess
import tempfile
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError
import io

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

def download_from_drive(file_id, local_path, service):
    """
    Download a file from Google Drive
    """
    try:
        print(f"📥 Downloading file ID {file_id} to {local_path}")
        
        # Get file metadata
        file_metadata = service.files().get(fileId=file_id).execute()
        print(f"📁 File: {file_metadata.get('name')}")
        print(f"📊 Size: {file_metadata.get('size')} bytes")
        
        # Download file
        request = service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            if status:
                print(f"📥 Download progress: {int(status.progress() * 100)}%")
        
        # Write to file
        with open(local_path, 'wb') as f:
            f.write(fh.getvalue())
        
        print(f"✅ Successfully downloaded to {local_path}")
        return True
        
    except HttpError as e:
        print(f"❌ Error downloading from Google Drive: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def restore_database(backup_file, database_url, drop_existing=False):
    """
    Restore database from backup file
    """
    try:
        # Check if file exists
        if not os.path.exists(backup_file):
            print(f"❌ Error: Backup file {backup_file} does not exist")
            return False
        
        # Check if file is compressed
        if backup_file.endswith('.gz'):
            print("📦 Detected compressed backup, decompressing...")
            subprocess.run(['gunzip', '-c', backup_file], check=True, stdout=subprocess.PIPE)
            # Remove .gz extension for the uncompressed file
            uncompressed_file = backup_file[:-3]
        else:
            uncompressed_file = backup_file
        
        # Convert asyncpg URL to psycopg2 URL for psql
        psql_url = database_url.replace("postgresql+asyncpg", "postgresql")
        psql_url = psql_url.replace("?ssl=require", "?sslmode=require")
        
        print(f"🔄 Restoring database from {uncompressed_file}")
        
        # Restore database
        cmd = ['psql', psql_url, '-f', uncompressed_file]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Database restored successfully!")
            return True
        else:
            print(f"❌ Error restoring database: {result.stderr}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during restore: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def find_backup_file(folder_id, filename, service):
    """
    Find backup file by name in Google Drive folder
    """
    try:
        query = f"'{folder_id}' in parents and name = '{filename}'"
        results = service.files().list(
            q=query,
            fields="files(id, name)"
        ).execute()
        
        files = results.get('files', [])
        if files:
            return files[0]['id']
        else:
            print(f"❌ File '{filename}' not found in folder")
            return None
            
    except HttpError as e:
        print(f"❌ Error searching for file: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Restore database from Google Drive backup')
    parser.add_argument('--folder-id', required=True, help='Google Drive folder ID')
    parser.add_argument('--filename', required=True, help='Backup filename')
    parser.add_argument('--database-url', required=True, help='Database connection URL')
    parser.add_argument('--drop-existing', action='store_true', help='Drop existing database before restore')
    
    args = parser.parse_args()
    
    # Initialize Google Drive service
    service = get_drive_service()
    if not service:
        sys.exit(1)
    
    # Find backup file
    file_id = find_backup_file(args.folder_id, args.filename, service)
    if not file_id:
        sys.exit(1)
    
    # Create temporary file for download
    with tempfile.NamedTemporaryFile(suffix='.sql.gz', delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        # Download backup from Google Drive
        if not download_from_drive(file_id, temp_path, service):
            sys.exit(1)
        
        # Restore database
        if not restore_database(temp_path, args.database_url, args.drop_existing):
            sys.exit(1)
            
        print("🎉 Database restore completed successfully!")
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)

if __name__ == '__main__':
    main()
