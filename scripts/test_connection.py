#!/usr/bin/env python3
"""
Test database connection and Google Drive access
"""
import os
import sys
import subprocess
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

def test_database_connection():
    """Test if we can connect to the database"""
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("❌ DATABASE_URL not set")
            return False
        
        print(f"🔍 Testing database connection...")
        print(f"📡 Database URL: {database_url[:50]}...")
        
        # Test connection with psql
        result = subprocess.run([
            'psql', database_url, '-c', 'SELECT version();'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Database connection successful!")
            print(f"📊 Database version: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Database connection failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Database connection timed out")
        return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def test_google_drive_access():
    """Test if we can access Google Drive"""
    try:
        service_account_key = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY')
        folder_id = os.getenv('GOOGLE_DRIVE_FOLDER_ID')
        
        if not service_account_key:
            print("❌ GOOGLE_SERVICE_ACCOUNT_KEY not set")
            return False
            
        if not folder_id:
            print("❌ GOOGLE_DRIVE_FOLDER_ID not set")
            return False
        
        print(f"🔍 Testing Google Drive access...")
        print(f"📁 Folder ID: {folder_id}")
        
        # Parse service account key
        try:
            service_account_info = json.loads(service_account_key)
        except json.JSONDecodeError:
            print("❌ Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY")
            return False
        
        # Create credentials
        credentials = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=['https://www.googleapis.com/auth/drive']
        )
        
        # Build service
        service = build('drive', 'v3', credentials=credentials)
        
        # Test access to folder
        try:
            folder = service.files().get(fileId=folder_id).execute()
            print("✅ Google Drive access successful!")
            print(f"📁 Folder name: {folder.get('name')}")
            return True
        except Exception as e:
            print(f"❌ Cannot access Google Drive folder: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Google Drive setup error: {e}")
        return False

def main():
    print("🧪 Testing CLOVE Backup Configuration")
    print("=" * 50)
    
    # Test database
    db_ok = test_database_connection()
    print()
    
    # Test Google Drive
    gdrive_ok = test_google_drive_access()
    print()
    
    # Summary
    print("📋 Test Summary:")
    print(f"Database: {'✅ OK' if db_ok else '❌ FAILED'}")
    print(f"Google Drive: {'✅ OK' if gdrive_ok else '❌ FAILED'}")
    
    if db_ok and gdrive_ok:
        print("\n🎉 All tests passed! Your backup should work.")
        return 0
    else:
        print("\n❌ Some tests failed. Check the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
