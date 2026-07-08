import os
import sys

def get_drive_service(credentials_path):
    if not os.path.exists(credentials_path):
        print(f"Credentials path {credentials_path} does not exist.")
        return None
    try:
        from googleapiclient.discovery import build
        from google.oauth2 import service_account
        
        SCOPES = ['https://www.googleapis.com/auth/drive']
        creds = service_account.Credentials.from_service_account_file(credentials_path, scopes=SCOPES)
        service = build('drive', 'v3', credentials=creds)
        return service
    except Exception as e:
        print(f"Error creating Google Drive service: {e}")
        return None

def get_or_create_folder(service, name, parent_id):
    q = f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
    results = service.files().list(q=q, fields="files(id)").execute()
    files = results.get('files', [])
    if files:
        return files[0]['id']
    else:
        file_metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        folder = service.files().create(body=file_metadata, fields='id').execute()
        return folder.get('id')

def upload_file_to_drive(service, file_path, folder_id):
    from googleapiclient.http import MediaFileUpload
    name = os.path.basename(file_path)
    file_metadata = {
        'name': name,
        'parents': [folder_id]
    }
    media = MediaFileUpload(file_path, resumable=True)
    file = service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()
    
    # Share publicly
    try:
        service.permissions().create(
            fileId=file.get('id'),
            body={'type': 'anyone', 'role': 'reader'}
        ).execute()
    except Exception as pe:
        print(f"Failed to set file permissions: {pe}")
        
    return file.get('id'), file.get('webViewLink')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python drive_service.py <credentials.json> <file_path>")
        sys.exit(1)
        
    creds_file = sys.argv[1]
    upload_path = sys.argv[2]
    
    service = get_drive_service(creds_file)
    if service:
        print("Successfully authenticated with Google Drive!")
        # Root folder specified by user
        root_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        print(f"Creating folders under parent ID: {root_id}")
        proj_folder = get_or_create_folder(service, "Projects", root_id)
        test_folder = get_or_create_folder(service, "Test Project", proj_folder)
        sub_folder = get_or_create_folder(service, "Gallery", test_folder)
        
        print(f"Uploading {upload_path}...")
        file_id, link = upload_file_to_drive(service, upload_path, sub_folder)
        print(f"Uploaded! File ID: {file_id}")
        print(f"Public Link: {link}")
