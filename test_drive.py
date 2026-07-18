import os
import sys

# Add current dir to path
sys.path.append(r"C:\Users\lathi\Documents\GITHUB\warriors-website-")

try:
    from server import get_drive_service
    service = get_drive_service()
    if not service:
        print("Drive service not available")
        sys.exit(1)
        
    parent_id = "1hb6LSvl2oBPJuAjPe29iyybp0lc5PgWt"
    
    print("Querying subfolders...")
    q_folders = f"'{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    folder_results = service.files().list(q=q_folders, fields="files(id, name)").execute()
    folders = folder_results.get('files', [])
    print(f"Found folders: {folders}")
    
    folder_ids = [parent_id] + [f['id'] for f in folders]
    parent_queries = " or ".join([f"'{fid}' in parents" for fid in folder_ids])
    q_images = f"({parent_queries}) and mimeType contains 'image/' and trashed = false"
    
    print("Querying images...")
    image_results = service.files().list(
        q=q_images, 
        fields="files(id, name, createdTime)",
        orderBy="createdTime desc",
        pageSize=100
    ).execute()
    
    files = image_results.get('files', [])
    print(f"Successfully retrieved {len(files)} files!")
    for f in files[:3]:
        print(f" - {f['name']} ({f['id']})")
        
except Exception as e:
    print(f"Exception raised: {type(e).__name__}: {e}")
