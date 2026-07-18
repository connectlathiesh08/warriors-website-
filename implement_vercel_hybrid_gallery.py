import os

server_py = r"C:\Users\lathi\Documents\GITHUB\warriors-website-\server.py"

with open(server_py, 'r', encoding='utf-8') as f:
    content = f.read()

old_proxy_and_gallery_block = """# Proxy route to stream images/files from Google Drive with local disk caching
CACHE_DIR = os.path.join(os.path.dirname(__file__), "uploads", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

@app.route('/api/project-image/<file_id>', methods=['GET'])
def get_project_image(file_id):
    # Read width query parameter, default to 1000
    width = request.args.get('w', '1000')
    
    # Local cache file path
    cache_filename = f"{file_id}_{width}.jpg"
    cache_filepath = os.path.join(CACHE_DIR, cache_filename)
    
    # 1. If cached locally, return it instantly!
    if os.path.exists(cache_filepath):
        from flask import send_file
        return send_file(cache_filepath, mimetype='image/jpeg', as_attachment=False)
        
    # 2. Try fetching public thumbnail using requests.get with verify=False
    try:
        import requests
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        url = f"https://drive.google.com/thumbnail?id={file_id}&sz=w{width}"
        resp = requests.get(url, verify=False, timeout=8)
        
        if resp.status_code == 200:
            with open(cache_filepath, 'wb') as f:
                f.write(resp.content)
            from flask import send_file
            return send_file(cache_filepath, mimetype='image/jpeg', as_attachment=False)
    except Exception as e:
        print(f"Fast proxy failed for {file_id}: {e}. Falling back to Drive API...")

    # 3. Fallback to standard Drive API downloader
    try:
        service = get_drive_service()
        if not service:
            return jsonify({"error": "Google Drive client not initialized"}), 500
            
        # Get file metadata to read content type
        meta = service.files().get(fileId=file_id, fields="mimeType").execute()
        mime_type = meta.get('mimeType', 'application/octet-stream')
        
        # Download media
        from googleapiclient.http import MediaIoBaseDownload
        import io
        
        request_obj = service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request_obj)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            
        data = fh.getvalue()
        # Save to local cache folder
        with open(cache_filepath, 'wb') as f:
            f.write(data)
            
        from flask import send_file
        return send_file(cache_filepath, mimetype=mime_type, as_attachment=False)
    except Exception as e:
        print(f"Error proxying Google Drive file {file_id}: {e}")
        return jsonify({"error": f"Failed to retrieve file: {str(e)}"}), 500

# GET /api/gallery (Background Thread Synchronized & Instantly Cached)
import threading
import json
import time

GALLERY_CACHE_FILE = os.path.join(os.path.dirname(__file__), "gallery_cache.json")
GALLERY_IN_MEMORY_CACHE = []

# Load initial cache from disk if available
if os.path.exists(GALLERY_CACHE_FILE):
    try:
        with open(GALLERY_CACHE_FILE, 'r', encoding='utf-8') as f:
            GALLERY_IN_MEMORY_CACHE = json.load(f)
        print(f"Loaded {len(GALLERY_IN_MEMORY_CACHE)} gallery items from local cache file.")
    except Exception as e:
        print(f"Error loading initial gallery cache: {e}")

def background_gallery_sync():
    global GALLERY_IN_MEMORY_CACHE
    # Sleep 15 seconds on startup to let Flask start up cleanly without GIL blocking
    time.sleep(15)
    while True:
        try:
            service = get_drive_service()
            if service:
                parent_id = "1hb6LSvl2oBPJuAjPe29iyybp0lc5PgWt"
                
                # 1. Query for subfolders inside the parent folder
                q_folders = f"'{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
                folder_results = service.files().list(q=q_folders, fields="files(id, name)").execute()
                folders = folder_results.get('files', [])
                
                # Collect parent folder ID + all subfolder IDs
                folder_ids = [parent_id] + [f['id'] for f in folders]
                
                # 2. Query for all images in these folders
                parent_queries = " or ".join([f"'{fid}' in parents" for fid in folder_ids])
                q_images = f"({parent_queries}) and mimeType contains 'image/' and trashed = false"
                
                image_results = service.files().list(
                    q=q_images, 
                    fields="files(id, name, createdTime)",
                    orderBy="createdTime desc",
                    pageSize=1000
                ).execute()
                
                files = image_results.get('files', [])
                
                new_gallery = []
                for index, f in enumerate(files):
                    file_id = f['id']
                    created_time = f.get('createdTime', '')
                    date_str = created_time.split('T')[0] if 'T' in created_time else ''
                    
                    # Remove extension from name
                    clean_name = f.get('name', 'Warrior Moment')
                    if '.' in clean_name:
                        clean_name = clean_name.rsplit('.', 1)[0]
                        
                    new_gallery.append({
                        "id": f"IMG-{index}",
                        "src": f"/api/project-image/{file_id}",
                        "drive_file_id": file_id,
                        "alt": clean_name,
                        "date": date_str
                    })
                
                if new_gallery:
                    GALLERY_IN_MEMORY_CACHE = new_gallery
                    with open(GALLERY_CACHE_FILE, 'w', encoding='utf-8') as f:
                        json.dump(new_gallery, f, indent=2)
                    # print("Gallery cache successfully synchronized with Google Drive.")
        except Exception as e:
            print(f"Background gallery sync error: {e}")
            
        # Poll Drive for changes every 60 seconds in the background
        time.sleep(60)

# Start background sync thread on startup
sync_thread = threading.Thread(target=background_gallery_sync, daemon=True)
sync_thread.start()

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    # If the in-memory cache is empty, return a quick offline fallback array so the gallery is never empty
    if not GALLERY_IN_MEMORY_CACHE:
        fallback = []
        for s in range(11):
            fallback.append({
                "id": f"IMG-{s}",
                "src": f"assets/projects/proj-{s}.png",
                "drive_file_id": "",
                "alt": "Warrior Moment",
                "date": ""
            })
        return jsonify(fallback)
    return jsonify(GALLERY_IN_MEMORY_CACHE)"""

new_proxy_and_gallery_block = """# Hybrid Vercel-optimized and Local server configuration
IS_VERCEL = 'VERCEL' in os.environ

if IS_VERCEL:
    CACHE_DIR = "/tmp/uploads_cache"
else:
    CACHE_DIR = os.path.join(os.path.dirname(__file__), "uploads", "cache")

os.makedirs(CACHE_DIR, exist_ok=True)

# Proxy route to stream images/files from Google Drive with local disk caching
@app.route('/api/project-image/<file_id>', methods=['GET'])
def get_project_image(file_id):
    # Read width query parameter, default to 1000
    width = request.args.get('w', '1000')
    
    # Local cache file path
    cache_filename = f"{file_id}_{width}.jpg"
    cache_filepath = os.path.join(CACHE_DIR, cache_filename)
    
    # 1. If cached locally, return it instantly!
    if os.path.exists(cache_filepath):
        from flask import send_file
        return send_file(cache_filepath, mimetype='image/jpeg', as_attachment=False)
        
    # 2. Try fetching public thumbnail using requests.get with verify=False
    try:
        import requests
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        url = f"https://drive.google.com/thumbnail?id={file_id}&sz=w{width}"
        resp = requests.get(url, verify=False, timeout=8)
        
        if resp.status_code == 200:
            with open(cache_filepath, 'wb') as f:
                f.write(resp.content)
            from flask import send_file
            return send_file(cache_filepath, mimetype='image/jpeg', as_attachment=False)
    except Exception as e:
        print(f"Fast proxy failed for {file_id}: {e}. Falling back to Drive API...")

    # 3. Fallback to standard Drive API downloader
    try:
        service = get_drive_service()
        if not service:
            return jsonify({"error": "Google Drive client not initialized"}), 500
            
        # Get file metadata to read content type
        meta = service.files().get(fileId=file_id, fields="mimeType").execute()
        mime_type = meta.get('mimeType', 'application/octet-stream')
        
        # Download media
        from googleapiclient.http import MediaIoBaseDownload
        import io
        
        request_obj = service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request_obj)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            
        data = fh.getvalue()
        # Save to local cache folder
        with open(cache_filepath, 'wb') as f:
            f.write(data)
            
        from flask import send_file
        return send_file(cache_filepath, mimetype=mime_type, as_attachment=False)
    except Exception as e:
        print(f"Error proxying Google Drive file {file_id}: {e}")
        return jsonify({"error": f"Failed to retrieve file: {str(e)}"}), 500

# GET /api/gallery (Hybrid SWR background thread locally, direct caching on Vercel)
import threading
import json
import time

GALLERY_CACHE_FILE = os.path.join(os.path.dirname(__file__), "gallery_cache.json")
GALLERY_IN_MEMORY_CACHE = []
GALLERY_LAST_UPDATED = 0

# Load initial cache from disk if available
if os.path.exists(GALLERY_CACHE_FILE):
    try:
        with open(GALLERY_CACHE_FILE, 'r', encoding='utf-8') as f:
            GALLERY_IN_MEMORY_CACHE = json.load(f)
        print(f"Loaded {len(GALLERY_IN_MEMORY_CACHE)} gallery items from local cache file.")
    except Exception as e:
        print(f"Error loading initial gallery cache: {e}")

def fetch_gallery_from_drive():
    service = get_drive_service()
    if not service:
        return []
    parent_id = "1hb6LSvl2oBPJuAjPe29iyybp0lc5PgWt"
    
    # 1. Query for subfolders
    q_folders = f"'{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    folder_results = service.files().list(q=q_folders, fields="files(id, name)").execute()
    folders = folder_results.get('files', [])
    
    folder_ids = [parent_id] + [f['id'] for f in folders]
    
    # 2. Query for all images in these folders
    parent_queries = " or ".join([f"'{fid}' in parents" for fid in folder_ids])
    q_images = f"({parent_queries}) and mimeType contains 'image/' and trashed = false"
    
    image_results = service.files().list(
        q=q_images, 
        fields="files(id, name, createdTime)",
        orderBy="createdTime desc",
        pageSize=1000
    ).execute()
    
    files = image_results.get('files', [])
    
    new_gallery = []
    for index, f in enumerate(files):
        file_id = f['id']
        created_time = f.get('createdTime', '')
        date_str = created_time.split('T')[0] if 'T' in created_time else ''
        
        clean_name = f.get('name', 'Warrior Moment')
        if '.' in clean_name:
            clean_name = clean_name.rsplit('.', 1)[0]
            
        new_gallery.append({
            "id": f"IMG-{index}",
            "src": f"/api/project-image/{file_id}",
            "drive_file_id": file_id,
            "alt": clean_name,
            "date": date_str
        })
    return new_gallery

def background_gallery_sync():
    global GALLERY_IN_MEMORY_CACHE, GALLERY_LAST_UPDATED
    # Sleep 15 seconds on startup to let Flask start up cleanly without GIL blocking
    time.sleep(15)
    while True:
        try:
            new_gallery = fetch_gallery_from_drive()
            if new_gallery:
                GALLERY_IN_MEMORY_CACHE = new_gallery
                GALLERY_LAST_UPDATED = time.time()
                try:
                    with open(GALLERY_CACHE_FILE, 'w', encoding='utf-8') as f:
                        json.dump(new_gallery, f, indent=2)
                except Exception as ex:
                    print(f"Failed to write gallery_cache.json: {ex}")
        except Exception as e:
            print(f"Background gallery sync error: {e}")
        time.sleep(60)

# Start background sync thread only if NOT running on Vercel
if not IS_VERCEL:
    sync_thread = threading.Thread(target=background_gallery_sync, daemon=True)
    sync_thread.start()

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    global GALLERY_IN_MEMORY_CACHE, GALLERY_LAST_UPDATED
    
    # On Vercel (stateless lambda), dynamically fetch every 60 seconds
    if IS_VERCEL:
        import sys
        now = time.time()
        if not GALLERY_IN_MEMORY_CACHE or (now - GALLERY_LAST_UPDATED > 60):
            try:
                new_gallery = fetch_gallery_from_drive()
                if new_gallery:
                    GALLERY_IN_MEMORY_CACHE = new_gallery
                    GALLERY_LAST_UPDATED = now
            except Exception as e:
                sys.stderr.write(f"Vercel gallery fetch error: {e}\\n")
                sys.stderr.flush()

    if not GALLERY_IN_MEMORY_CACHE:
        fallback = []
        for s in range(11):
            fallback.append({
                "id": f"IMG-{s}",
                "src": f"assets/projects/proj-{s}.png",
                "drive_file_id": "",
                "alt": "Warrior Moment",
                "date": ""
            })
        return jsonify(fallback)
    return jsonify(GALLERY_IN_MEMORY_CACHE)"""

if old_proxy_and_gallery_block in content:
    content = content.replace(old_proxy_and_gallery_block, new_proxy_and_gallery_block)
    print("-> Updated server.py with Vercel hybrid gallery cache integration.")
elif old_proxy_and_gallery_block.replace('\n', '\r\n') in content:
    content = content.replace(old_proxy_and_gallery_block.replace('\n', '\r\n'), new_proxy_and_gallery_block)
    print("-> Updated server.py (CRLF) with Vercel hybrid gallery cache integration.")
else:
    print("-> Error: Could not locate old proxy/gallery block in server.py!")

with open(server_py, 'w', encoding='utf-8') as f:
    f.write(content)
