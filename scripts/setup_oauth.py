#!/usr/bin/env python3
"""
Setup OAuth 2.0 for Google Drive access
Run this script locally to generate the token.json file
"""
import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials

# Scopes for Google Drive access
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def setup_oauth():
    """
    Setup OAuth 2.0 credentials for Google Drive
    """
    print("🔧 Setting up OAuth 2.0 for Google Drive...")
    
    # Check if credentials.json exists
    if not os.path.exists('credentials.json'):
        print("❌ Error: credentials.json not found!")
        print("Please download your OAuth 2.0 credentials from Google Cloud Console")
        print("and save them as 'credentials.json' in this directory.")
        return False
    
    try:
        # Create the flow
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES)
        
        # Run the OAuth flow
        print("🌐 Opening browser for OAuth authentication...")
        creds = flow.run_local_server(port=0)
        
        # Save the credentials with all required fields
        token_data = {
            'token': creds.token,
            'refresh_token': creds.refresh_token,
            'token_uri': creds.token_uri,
            'client_id': creds.client_id,
            'client_secret': creds.client_secret,
            'scopes': creds.scopes
        }
        
        with open('token.json', 'w') as token:
            json.dump(token_data, token, indent=2)
        
        print("✅ OAuth setup complete!")
        print("📁 token.json has been created with all required fields")
        print("🔐 You can now use this token for automated backups")
        print("📋 Token contains: access_token, refresh_token, client_secret, and scopes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during OAuth setup: {e}")
        return False

if __name__ == '__main__':
    setup_oauth()
