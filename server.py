import os
import sys
import json
import sqlite3
import datetime
from pathlib import Path

# Self-bootstrap dependencies if they are missing
def install_and_import(package, import_name=None):
    if import_name is None:
        import_name = package
    try:
        __import__(import_name)
    except ImportError:
        print(f"Package '{package}' is required. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# Make sure Flask and CORS are installed
install_and_import("Flask", "flask")
install_and_import("flask-cors", "flask_cors")

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import safe_join
from flask_cors import CORS

app = Flask(__name__, static_folder=None)
CORS(app)

# Detect if running in Vercel or read-only filesystem
is_vercel = os.environ.get("VERCEL") or os.environ.get("NOW_REGION") or not os.access(os.path.dirname(os.path.abspath(__file__)) if os.path.dirname(os.path.abspath(__file__)) else ".", os.W_OK)
if is_vercel:
    DB_PATH = "/tmp/projects.db"
    UPLOADS_DIR = "/tmp/uploads"
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "projects.db")
    UPLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Google Drive client requirements (optional, fallback to local uploads)
GOOGLE_CREDENTIALS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "google-credentials.json")
GOOGLE_OAUTH_SECRETS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "google-oauth-credentials.json")
GOOGLE_TOKEN_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "google-token.json")
has_google_drive = False
drive_service = None
drive_initialization_error = None


def load_credentials(scopes):
    from google.auth.transport.requests import Request
    import json
    
    # 1. Try environment variables first
    google_token_env = os.environ.get("GOOGLE_TOKEN_JSON")
    google_creds_env = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    
    if google_token_env:
        from google.oauth2.credentials import Credentials
        try:
            token_data = json.loads(google_token_env)
            client_id = None
            client_secret = None
            token_uri = "https://oauth2.googleapis.com/token"
            
            google_oauth_env = os.environ.get("GOOGLE_OAUTH_SECRETS_JSON")
            if google_oauth_env:
                sf_data = json.loads(google_oauth_env)
                cfg = sf_data.get("installed", sf_data.get("web", {}))
                client_id = cfg.get("client_id")
                client_secret = cfg.get("client_secret")
                token_uri = cfg.get("token_uri", "https://oauth2.googleapis.com/token")
                
            creds = Credentials(
                token=token_data.get("access_token"),
                refresh_token=token_data.get("refresh_token"),
                client_id=client_id,
                client_secret=client_secret,
                token_uri=token_uri,
                scopes=scopes
            )
            if creds.expired or not creds.valid:
                creds.refresh(Request())
                token_data["access_token"] = creds.token
                os.environ["GOOGLE_TOKEN_JSON"] = json.dumps(token_data)
                if os.path.exists(GOOGLE_TOKEN_PATH):
                    try:
                        with open(GOOGLE_TOKEN_PATH, "w", encoding="utf-8") as tf:
                            json.dump(token_data, tf, indent=2)
                    except:
                        pass
            return creds
        except Exception as ex:
            print(f"Error loading credentials from GOOGLE_TOKEN_JSON env: {ex}")
            
    if google_creds_env:
        from google.oauth2 import service_account
        try:
            creds_data = json.loads(google_creds_env)
            return service_account.Credentials.from_service_account_info(creds_data, scopes=scopes)
        except Exception as ex:
            print(f"Error loading credentials from GOOGLE_CREDENTIALS_JSON env: {ex}")
        
    # 2. Fall back to local files
    if os.path.exists(GOOGLE_TOKEN_PATH):
        from google.oauth2.credentials import Credentials
        try:
            with open(GOOGLE_TOKEN_PATH, "r", encoding="utf-8") as tf:
                token_data = json.load(tf)
            client_id = None
            client_secret = None
            token_uri = "https://oauth2.googleapis.com/token"
            if os.path.exists(GOOGLE_OAUTH_SECRETS_PATH):
                with open(GOOGLE_OAUTH_SECRETS_PATH, "r", encoding="utf-8") as sf:
                    sf_data = json.load(sf)
                cfg = sf_data.get("installed", sf_data.get("web", {}))
                client_id = cfg.get("client_id")
                client_secret = cfg.get("client_secret")
                token_uri = cfg.get("token_uri", "https://oauth2.googleapis.com/token")
            creds = Credentials(
                token=token_data.get("access_token"),
                refresh_token=token_data.get("refresh_token"),
                client_id=client_id,
                client_secret=client_secret,
                token_uri=token_uri,
                scopes=scopes
            )
            if creds.expired or not creds.valid:
                creds.refresh(Request())
                token_data["access_token"] = creds.token
                with open(GOOGLE_TOKEN_PATH, "w", encoding="utf-8") as tf:
                    json.dump(token_data, tf, indent=2)
            return creds
        except Exception as ex:
            print(f"Error loading credentials from google-token.json file: {ex}")

    if os.path.exists(GOOGLE_CREDENTIALS_PATH):
        from google.oauth2 import service_account
        try:
            return service_account.Credentials.from_service_account_file(GOOGLE_CREDENTIALS_PATH, scopes=scopes)
        except Exception as ex:
            print(f"Error loading credentials from google-credentials.json file: {ex}")
        
    return None


has_creds = (
    os.path.exists(GOOGLE_TOKEN_PATH) or 
    os.path.exists(GOOGLE_CREDENTIALS_PATH) or
    os.environ.get("GOOGLE_TOKEN_JSON") or
    os.environ.get("GOOGLE_CREDENTIALS_JSON")
)
if has_creds:
    try:
        install_and_import("google-api-python-client", "googleapiclient")
        install_and_import("google-auth-httplib2", "google_auth_httplib2")
        install_and_import("google-auth-oauthlib", "google_auth_oauthlib")
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        
        SCOPES = ['https://www.googleapis.com/auth/drive']
        creds = load_credentials(SCOPES)
        if creds:
            drive_service = build('drive', 'v3', credentials=creds)
            has_google_drive = True
            print("Google Drive API Client successfully initialized.")
        else:
            raise Exception("Failed to resolve credentials from files or environment variables.")
    except Exception as e:
        drive_initialization_error = f"Failed to initialize Google Drive client: {e}"
        print(f"Warning: {drive_initialization_error}. Falling back to local disk storage.")
else:
    drive_initialization_error = "Google Drive API credentials file or environment variables are missing."
    print(f"Warning: {drive_initialization_error}. Falling back to local disk storage.")

# Thread-safe helper to get Google Drive service
def get_drive_service():
    global drive_service
    import httplib2
    import google_auth_httplib2
    import googleapiclient.http
    from googleapiclient.discovery import build
    
    if os.path.exists(GOOGLE_TOKEN_PATH):
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
            
            with open(GOOGLE_TOKEN_PATH, "r", encoding="utf-8") as tf:
                token_data = json.load(tf)
                
            client_id = None
            client_secret = None
            token_uri = "https://oauth2.googleapis.com/token"
            
            if os.path.exists(GOOGLE_OAUTH_SECRETS_PATH):
                with open(GOOGLE_OAUTH_SECRETS_PATH, "r", encoding="utf-8") as sf:
                    sf_data = json.load(sf)
                cfg = sf_data.get("installed", sf_data.get("web", {}))
                client_id = cfg.get("client_id")
                client_secret = cfg.get("client_secret")
                token_uri = cfg.get("token_uri", "https://oauth2.googleapis.com/token")
                
            creds = Credentials(
                token=token_data.get("access_token"),
                refresh_token=token_data.get("refresh_token"),
                client_id=client_id,
                client_secret=client_secret,
                token_uri=token_uri,
                scopes=['https://www.googleapis.com/auth/drive']
            )
            
            if creds.expired or not creds.valid:
                creds.refresh(Request())
                token_data["access_token"] = creds.token
                with open(GOOGLE_TOKEN_PATH, "w", encoding="utf-8") as tf:
                    json.dump(token_data, tf, indent=2)
            
            def build_request(http, *args, **kwargs):
                new_http = google_auth_httplib2.AuthorizedHttp(creds, http=httplib2.Http())
                return googleapiclient.http.HttpRequest(new_http, *args, **kwargs)
                
            return build('drive', 'v3', credentials=creds, requestBuilder=build_request)
        except Exception as e:
            print(f"Error building thread-safe drive service (OAuth): {e}")
            
    if os.path.exists(GOOGLE_CREDENTIALS_PATH):
        try:
            from google.oauth2 import service_account
            creds = service_account.Credentials.from_service_account_file(GOOGLE_CREDENTIALS_PATH, scopes=['https://www.googleapis.com/auth/drive'])
            
            def build_request(http, *args, **kwargs):
                new_http = google_auth_httplib2.AuthorizedHttp(creds, http=httplib2.Http())
                return googleapiclient.http.HttpRequest(new_http, *args, **kwargs)
                
            return build('drive', 'v3', credentials=creds, requestBuilder=build_request)
        except Exception as e:
            print(f"Error building thread-safe drive service (Service Account): {e}")
            
    return drive_service


# Database backup and recovery to/from Google Drive
def backup_db_to_google_drive():
    if not has_google_drive:
        return
    try:
        service = get_drive_service()
        if not service:
            return
            
        parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        
        # Search for existing projects.db
        q = f"name = 'projects.db' and '{parent_folder_id}' in parents and trashed = false"
        res = service.files().list(q=q, fields="files(id)").execute()
        files = res.get('files', [])
        
        from googleapiclient.http import MediaFileUpload
        media = MediaFileUpload(DB_PATH, mimetype='application/x-sqlite3', resumable=True)
        
        if files:
            file_id = files[0]['id']
            service.files().update(fileId=file_id, media_body=media).execute()
            print(f"Successfully backed up projects.db to Google Drive (Updated file ID: {file_id}).")
        else:
            file_metadata = {
                'name': 'projects.db',
                'parents': [parent_folder_id]
            }
            new_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
            print(f"Successfully backed up projects.db to Google Drive (Created new file ID: {new_file.get('id')}).")
    except Exception as e:
        print(f"Error backing up database to Google Drive: {e}")

def restore_db_from_google_drive():
    if not has_google_drive:
        return
    try:
        service = get_drive_service()
        if not service:
            return
            
        parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        q = f"name = 'projects.db' and '{parent_folder_id}' in parents and trashed = false"
        res = service.files().list(q=q, fields="files(id)").execute()
        files = res.get('files', [])
        
        if files:
            file_id = files[0]['id']
            print(f"Found projects.db on Google Drive (ID: {file_id}). Downloading...")
            
            import io
            from googleapiclient.http import MediaIoBaseDownload
            request = service.files().get_media(fileId=file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
                
            fh.seek(0)
            with open(DB_PATH, "wb") as f:
                f.write(fh.read())
            print("Successfully restored projects.db from Google Drive!")
        else:
            print("No projects.db found on Google Drive. Using local database.")
    except Exception as e:
        print(f"Error restoring database from Google Drive: {e}")

@app.after_request
def after_request_handler(response):
    # If a modifying request was successful, trigger background database backup to Google Drive
    if request.method in ('POST', 'PUT', 'DELETE') and 200 <= response.status_code < 300:
        if '/api/' in request.path:
            import threading
            threading.Thread(target=backup_db_to_google_drive).start()
    return response

# Helper to generate Slug from Title
def generate_slug(title, id_val):
    if not title:
        return f"project-{id_val}"
    slug = title.lower().strip()
    import re
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

# Database Initialization
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE,
            title TEXT,
            short_description TEXT,
            full_description TEXT,
            avenue TEXT,
            date TEXT,
            time TEXT,
            venue TEXT,
            google_map_location TEXT,
            chief_guest TEXT,
            project_lead TEXT,
            volunteers TEXT,
            sponsors TEXT,
            partners TEXT,
            budget INTEGER DEFAULT 0,
            funds_raised INTEGER DEFAULT 0,
            beneficiaries INTEGER DEFAULT 0,
            impact INTEGER DEFAULT 0,
            gallery TEXT,
            cover_image TEXT,
            documents TEXT,
            videos TEXT,
            status TEXT,
            created_by TEXT,
            created_date TEXT,
            last_updated TEXT,
            published_date TEXT,
            is_deleted INTEGER DEFAULT 0,
            deleted_at TEXT
        )
    """)
    
    # Run migrations to add missing metadata columns
    c.execute("PRAGMA table_info(projects)")
    columns = [col[1] for col in c.fetchall()]
    new_cols = {
        'cover_image_drive_id': 'TEXT',
        'cover_image_url': 'TEXT',
        'cover_image_filename': 'TEXT',
        'cover_image_mime_type': 'TEXT',
        'cover_image_uploaded_at': 'TEXT'
    }
    for col_name, col_type in new_cols.items():
        if col_name not in columns:
            c.execute(f"ALTER TABLE projects ADD COLUMN {col_name} {col_type}")
            
    # Create events table
    c.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            name TEXT,
            date TEXT,
            time TEXT,
            venue TEXT,
            registrations INTEGER DEFAULT 0,
            budget INTEGER DEFAULT 0,
            status TEXT,
            attendance INTEGER DEFAULT 0,
            category TEXT,
            description TEXT,
            google_event_id TEXT
        )
    """)

    # Create settings table
    c.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    # Insert default settings if missing
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('google_calendar_id', '')")

    # Create finances table
    c.execute("""
        CREATE TABLE IF NOT EXISTS finances (
            id TEXT PRIMARY KEY,
            description TEXT,
            category TEXT,
            type TEXT,
            amount INTEGER,
            date TEXT,
            reference_note TEXT,
            invoice_url TEXT,
            invoice_drive_id TEXT
        )
    """)
    
    # Run migrations for invoice columns in case DB already exists
    c.execute("PRAGMA table_info(finances)")
    fin_columns = [col[1] for col in c.fetchall()]
    if 'invoice_url' not in fin_columns:
        c.execute("ALTER TABLE finances ADD COLUMN invoice_url TEXT")
    if 'invoice_drive_id' not in fin_columns:
        c.execute("ALTER TABLE finances ADD COLUMN invoice_drive_id TEXT")

    # Insert default finances if empty (disabled for fresh ledger)
    pass

    # Insert default events if empty
    c.execute("SELECT COUNT(*) FROM events")
    if c.fetchone()[0] == 0:
        default_events = [
            ('EVT-201', 'Installation Ceremony', '2026-07-01', '18:00', 'Ritz Carlton Ballroom', 150, 45000, 'Completed', 92, 'meeting', 'Welcome ceremony'),
            ('EVT-202', 'Core Committee Meeting', '2026-07-10', '19:00', 'Club House', 15, 500, 'Upcoming', 0, 'meeting', 'Regular agenda discussion'),
            ('EVT-203', 'Speaker Session on Leadership', '2026-07-15', '18:30', 'Zoom Meeting', 85, 2000, 'Upcoming', 0, 'fellowship', 'Invited speaker session'),
            ('EVT-204', 'Community Blood Donation Drive', '2026-07-20', '09:00', 'Rotary Hall, Bangalore', 120, 6000, 'Upcoming', 0, 'club', 'Annual blood donation drive')
        ]
    # Create gallery table
    c.execute("""
        CREATE TABLE IF NOT EXISTS gallery (
            id TEXT PRIMARY KEY,
            google_drive_id TEXT,
            description TEXT,
            date TEXT
        )
    """)
    
    # Insert default gallery placeholders if empty
    c.execute("SELECT COUNT(*) FROM gallery")
    if c.fetchone()[0] == 0:
        default_gallery = []
        for s in range(11):
            img_id = f"IMG-{s + 301}"
            default_gallery.append((img_id, f"assets/projects/proj-{s}.png", f"Warrior Moment {s + 1}", datetime.date.today().isoformat()))
        c.executemany("INSERT INTO gallery (id, google_drive_id, description, date) VALUES (?, ?, ?, ?)", default_gallery)

    # Create moms table
    c.execute("""
        CREATE TABLE IF NOT EXISTS moms (
            id TEXT PRIMARY KEY,
            title TEXT,
            type TEXT,
            number TEXT,
            date TEXT,
            time TEXT,
            venue TEXT,
            chaired_by TEXT,
            recorded_by TEXT,
            link TEXT,
            attendance TEXT,
            agenda TEXT,
            discussions TEXT,
            action_items TEXT,
            status TEXT DEFAULT 'Draft',
            created_at TEXT,
            pdf_url TEXT,
            google_drive_pdf_id TEXT,
            president_name TEXT,
            secretary_name TEXT,
            money_involved TEXT
        )
    """)
    try:
        c.execute("ALTER TABLE moms ADD COLUMN pdf_url TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE moms ADD COLUMN google_drive_pdf_id TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE moms ADD COLUMN president_name TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE moms ADD COLUMN secretary_name TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        c.execute("ALTER TABLE moms ADD COLUMN money_involved TEXT")
    except sqlite3.OperationalError:
        pass
    
    # Insert a default approved MoM if empty
    c.execute("SELECT COUNT(*) FROM moms")
    if c.fetchone()[0] == 0:
        import json
        default_attendance = json.dumps({
            "present_ids": [],
            "absent_ids": [],
            "guests": ["Rtr. Lathiesh Kumar", "Rtr. Rishabh Guptha"]
        })
        default_agenda = json.dumps([
            "Welcome Address",
            "Confirmation of Previous MoM",
            "Project Updates",
            "Finance Update",
            "New Proposals",
            "Any Other Business"
        ])
        default_discussions = json.dumps([
            "The meeting was called to order by the President. All members were welcomed.",
            "Minutes of the previous board meeting were read and confirmed unanimously.",
            "Updates on blood donation drive and plantation projects were presented.",
            "The treasurer presented the monthly expense ledger, which was approved.",
            "Proposals for the upcoming fellowship event were discussed.",
            "No other business was discussed. The meeting ended with a vote of thanks."
        ])
        default_action_items = json.dumps([
            {"id": "ACT-1", "task": "Send blood drive certificates", "assigned_to_id": "", "assigned_to_name": "Rtr. Lathiesh Kumar", "due_date": "2026-07-15", "status": "Pending"}
        ])
        c.execute("""
            INSERT INTO moms (id, title, type, number, date, time, venue, chaired_by, recorded_by, link, attendance, agenda, discussions, action_items, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "MOM-1", "Board Meeting", "Board Meeting", "BM/2026-27/01", "2026-07-07", "03:00 PM", "Google Meet",
            "Rtr. Rishabh Guptha (President)", "Rtr. Lathiesh Kumar (Secretary)", "https://meet.google.com/abc-defg-hij",
            default_attendance, default_agenda, default_discussions, default_action_items, "Approved", datetime.datetime.now().isoformat()
        ))

    # Create members table
    c.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id TEXT PRIMARY KEY,
            photo TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            role TEXT,
            position TEXT,
            status TEXT,
            payment TEXT,
            isSecretaryAdmin INTEGER DEFAULT 0
        )
    """)
    c.execute("SELECT COUNT(*) FROM members")
    if c.fetchone()[0] == 0:
        default_members = [
            ('WR-001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', 'Lathiesh Kumar', 'Racwarriors2023@gmail.com', '9876543210', 'Super Admin', 'Secretary', 'Active', 'Paid', 1),
            ('WR-002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', 'Anil Gupta', 'anil.gupta@gmail.com', '9876543211', 'President', 'President', 'Active', 'Paid', 0),
            ('WR-003', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 'Priya Sharma', 'priya.sharma@yahoo.com', '9876543212', 'Treasurer', 'Treasurer', 'Active', 'Paid', 0),
            ('WR-004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', 'Rohan Das', 'rohan.das@outlook.com', '9876543213', 'Director', 'Community Service Director', 'Active', 'Paid', 0),
            ('WR-005', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', 'Sneha Roy', 'sneha.roy@gmail.com', '9876543214', 'Member', 'Public Relations Chair', 'Active', 'Paid', 0),
            ('WR-006', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', 'Vikram Singh', 'vikram.singh@gmail.com', '9876543215', 'Member', 'General Member', 'Inactive', 'Unpaid', 0)
        ]
        c.executemany("""
            INSERT INTO members (id, photo, name, email, phone, role, position, status, payment, isSecretaryAdmin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_members)

    conn.commit()
    conn.close()

init_db()

# Clean up Trash older than 30 days
def cleanup_trash():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        limit_date = (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat()
        c.execute("DELETE FROM projects WHERE is_deleted = 1 AND deleted_at < ?", (limit_date,))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error cleaning trash: {e}")

def get_drive_error_message(e):
    try:
        from googleapiclient.errors import HttpError
        if isinstance(e, HttpError):
            status = e.resp.status
            content = e.content.decode('utf-8') if isinstance(e.content, bytes) else str(e.content)
            try:
                content_json = json.loads(content)
                msg = content_json.get('error', {}).get('message', '')
            except:
                msg = content
            
            if status == 404:
                return f"Folder not found or invalid Folder ID (HTTP 404: {msg})"
            elif status == 403:
                return f"Permission denied. Service Account lacks Editor access to the folder (HTTP 403: {msg})"
            elif status == 401:
                return f"Authentication failed / OAuth token expired (HTTP 401: {msg})"
            elif status == 429:
                return f"Google Drive API quota exceeded (HTTP 429: {msg})"
            else:
                return f"Google Drive API error (HTTP {status}: {msg})"
    except:
        pass
    
    err_str = str(e)
    if "credentials" in err_str.lower() or "auth" in err_str.lower():
        return f"Invalid Service Account credentials: {err_str}"
    if "timeout" in err_str.lower():
        return f"Network timeout: {err_str}"
    return f"Google Drive upload failed: {err_str}"

# Helper: Upload file to Google Drive
def handle_file_upload(file_obj, project_name, subfolder):
    if not file_obj or file_obj.filename == '':
        return None
        
    filename = file_obj.filename
    safe_filename = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
    
    # 1. Try Google Drive if enabled
    if has_google_drive:
        try:
            service = get_drive_service()
            if service:
                parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
                temp_path = os.path.join(UPLOADS_DIR, f"temp_{int(datetime.datetime.now().timestamp())}_{safe_filename}")
                os.makedirs(UPLOADS_DIR, exist_ok=True)
                file_obj.save(temp_path)
                
                def get_or_create_drive_folder(name, parent_id):
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
                        
                projects_id = get_or_create_drive_folder("Projects", parent_folder_id)
                proj_name_id = get_or_create_drive_folder(project_name, projects_id)
                subfolder_id = get_or_create_drive_folder(subfolder, proj_name_id)
                
                file_metadata = {
                    'name': safe_filename,
                    'parents': [subfolder_id]
                }
                mime_type = file_obj.content_type
                if not mime_type:
                    import mimetypes
                    mime_type, _ = mimetypes.guess_type(safe_filename)
                if not mime_type:
                    mime_type = 'application/octet-stream'
                    
                media = MediaFileUpload(temp_path, mimetype=mime_type, resumable=True)
                uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                
                file_id = uploaded_file.get('id')
                
                try:
                    service.permissions().create(
                        fileId=file_id,
                        body={'type': 'anyone', 'role': 'reader'}
                    ).execute()
                except Exception as pe:
                    print(f"Warning setting file permissions: {pe}")
                    
                view_url = f"https://drive.google.com/uc?export=download&id={file_id}"
                upload_time = datetime.datetime.now().isoformat()
                
                # Delete temp file
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except:
                        pass
                        
                return {
                    'drive_file_id': file_id,
                    'public_url': view_url,
                    'filename': safe_filename,
                    'mime_type': mime_type,
                    'uploaded_at': upload_time
                }
        except Exception as e:
            print(f"Google Drive upload failed, falling back to local storage: {e}")
            
    # 2. Local fallback storage
    local_filename = f"{int(datetime.datetime.now().timestamp())}_{safe_filename}"
    local_path = os.path.join(UPLOADS_DIR, local_filename)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    file_obj.save(local_path)
    
    view_url = f"/uploads/{local_filename}"
    upload_time = datetime.datetime.now().isoformat()
    return {
        'drive_file_id': None,
        'public_url': view_url,
        'filename': safe_filename,
        'mime_type': file_obj.content_type or 'application/octet-stream',
        'uploaded_at': upload_time
    }

def handle_base64_upload(base64_str, project_name, subfolder):
    if not base64_str or not base64_str.startswith("data:image/"):
        return None
        
    try:
        import base64
        import re
        header, encoded = base64_str.split(",", 1)
        ext_match = re.search(r'data:image/(\w+);', header)
        file_extension = ext_match.group(1) if ext_match else "jpg"
        
        mime_type = f"image/{file_extension}"
        if file_extension == "jpg":
            mime_type = "image/jpeg"
            
        data = base64.b64decode(encoded)
        filename = f"cover_{int(datetime.datetime.now().timestamp())}.{file_extension}"
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        temp_path = os.path.join(UPLOADS_DIR, f"temp_{filename}")
        with open(temp_path, "wb") as f:
            f.write(data)
            
        # 1. Try Google Drive if enabled
        if has_google_drive:
            try:
                service = get_drive_service()
                if service:
                    parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
                    
                    def get_or_create_drive_folder(name, parent_id):
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
                            
                    projects_id = get_or_create_drive_folder("Projects", parent_folder_id)
                    proj_name_id = get_or_create_drive_folder(project_name, projects_id)
                    subfolder_id = get_or_create_drive_folder(subfolder, proj_name_id)
                    
                    file_metadata = {
                        'name': filename,
                        'parents': [subfolder_id]
                    }
                    media = MediaFileUpload(temp_path, mimetype=mime_type, resumable=True)
                    uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                    
                    file_id = uploaded_file.get('id')
                    
                    try:
                        service.permissions().create(
                            fileId=file_id,
                            body={'type': 'anyone', 'role': 'reader'}
                        ).execute()
                    except Exception as pe:
                        print(f"Warning setting file permissions: {pe}")
                        
                    view_url = f"https://drive.google.com/uc?export=download&id={file_id}"
                    upload_time = datetime.datetime.now().isoformat()
                    
                    if os.path.exists(temp_path):
                        try:
                            os.remove(temp_path)
                        except:
                            pass
                            
                    return {
                        'drive_file_id': file_id,
                        'public_url': view_url,
                        'filename': filename,
                        'mime_type': mime_type,
                        'uploaded_at': upload_time
                    }
            except Exception as e:
                print(f"Google Drive upload failed for base64 cover, falling back to local: {e}")
                
        # 2. Local fallback storage
        local_filename = filename
        local_path = os.path.join(UPLOADS_DIR, local_filename)
        if os.path.exists(temp_path):
            os.rename(temp_path, local_path)
        else:
            with open(local_path, "wb") as f:
                f.write(data)
                
        view_url = f"/uploads/{local_filename}"
        upload_time = datetime.datetime.now().isoformat()
        return {
            'drive_file_id': None,
            'public_url': view_url,
            'filename': filename,
            'mime_type': mime_type,
            'uploaded_at': upload_time
        }
    except Exception as e:
        print(f"Error handling base64 upload: {e}")
        return None

# Serve uploads folder static files
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOADS_DIR, filename)

# Proxy route to stream images/files from Google Drive
@app.route('/api/project-image/<file_id>', methods=['GET'])
def get_project_image(file_id):
    try:
        service = get_drive_service()
        if not service:
            return jsonify({"error": "Google Drive client not initialized"}), 500
            
        # Get file metadata to read content type and name
        meta = service.files().get(fileId=file_id, fields="mimeType,name").execute()
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
            
        fh.seek(0)
        from flask import send_file
        return send_file(
            fh,
            mimetype=mime_type,
            as_attachment=False,
            download_name=meta.get('name', 'file')
        )
    except Exception as e:
        print(f"Error proxying Google Drive file {file_id}: {e}")
        return jsonify({"error": f"Failed to retrieve file: {str(e)}"}), 500

# Helper to dynamically convert Google Drive URLs to the backend proxy endpoint
def convert_drive_urls(val):
    if isinstance(val, str):
        import re
        match = re.search(r'id=([a-zA-Z0-9_-]{25,})', val)
        if not match:
            match = re.search(r'/file/d/([a-zA-Z0-9_-]{25,})', val)
        if match:
            file_id = match.group(1)
            return f"{request.host_url}api/project-image/{file_id}"
        return val
    elif isinstance(val, list):
        return [convert_drive_urls(item) for item in val]
    elif isinstance(val, dict):
        return {k: convert_drive_urls(v) for k, v in val.items()}
    return val

# REST API Endpoints

# GET /api/projects
@app.route('/api/projects', methods=['GET'])
def get_projects():
    cleanup_trash()
    
    status = request.args.get('status')
    search_query = request.args.get('q')
    sort_order = request.args.get('sort', 'newest')
    show_trash = request.args.get('trash') == 'true'
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    query_str = "SELECT * FROM projects WHERE 1=1"
    params = []
    
    if show_trash:
        query_str += " AND is_deleted = 1"
    else:
        query_str += " AND is_deleted = 0"
        
    if status:
        query_str += " AND LOWER(status) = ?"
        params.append(status.lower())
        
    if search_query:
        query_str += " AND (title LIKE ? OR project_lead LIKE ? OR avenue LIKE ? OR date LIKE ? OR status LIKE ?)"
        like_query = f"%{search_query}%"
        params.extend([like_query, like_query, like_query, like_query, like_query])
        
    if sort_order == 'oldest':
        query_str += " ORDER BY date ASC, created_date ASC"
    else:
        query_str += " ORDER BY date DESC, created_date DESC"
        
    c.execute(query_str, params)
    rows = c.fetchall()
    conn.close()
    
    projects_list = []
    for r in rows:
        p = dict(r)
        # Parse fields stored as JSON arrays
        for field in ('gallery', 'documents', 'videos', 'volunteers', 'sponsors', 'partners'):
            if p.get(field):
                try:
                    p[field] = json.loads(p[field])
                except:
                    p[field] = []
            else:
                p[field] = []
        # Support isPublished field mapping
        p['isPublished'] = p['status'] == 'Published'
        
        # Convert any Google Drive links to proxy endpoint URLs
        p = convert_drive_urls(p)
        projects_list.append(p)
        
    return jsonify(projects_list)

# GET /api/projects/:slug
@app.route('/api/projects/<slug>', methods=['GET'])
def get_project_by_slug(slug):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if slug.startswith("PRJ-"):
        c.execute("SELECT * FROM projects WHERE id = ? AND is_deleted = 0", (slug,))
    else:
        c.execute("SELECT * FROM projects WHERE slug = ? AND is_deleted = 0", (slug,))
        
    row = c.fetchone()
    conn.close()
    
    if not row:
        return jsonify({"error": "Project not found"}), 404
        
    p = dict(row)
    for field in ('gallery', 'documents', 'videos', 'volunteers', 'sponsors', 'partners'):
        if p.get(field):
            try:
                p[field] = json.loads(p[field])
            except:
                p[field] = []
        else:
            p[field] = []
    p['isPublished'] = p['status'] == 'Published'
    
    # Convert any Google Drive links to proxy endpoint URLs
    p = convert_drive_urls(p)
    return jsonify(p)

# POST /api/projects
@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.form.to_dict()
    
    # Generate unique ID by finding the maximum numeric ID and adding 1
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM projects")
    rows = c.fetchall()
    max_num = 100
    for r in rows:
        pid = r[0]
        if pid.startswith("PRJ-"):
            try:
                num = int(pid.split("-")[1])
                if num > max_num:
                    max_num = num
            except:
                pass
    proj_id = f"PRJ-{max_num + 1}"
    
    # Extract details
    title = data.get('title', 'Untitled Project')
    slug = data.get('slug', '')
    if not slug:
        slug = generate_slug(title, proj_id)
        
    # Check if slug exists, make unique if needed
    # Check if slug exists, make unique if needed
    c.execute("SELECT COUNT(*) FROM projects WHERE slug = ?", (slug,))
    exists = c.fetchone()[0]
    conn.close() # Close immediately before doing network requests!
    if exists > 0:
        slug = f"{slug}-{int(datetime.datetime.now().timestamp())}"
        
    cover_image_url = data.get('cover_image', 'assets/projects/proj-0.png')
    cover_image_metadata = {
        'drive_file_id': None,
        'public_url': None,
        'filename': None,
        'mime_type': None,
        'uploaded_at': None
    }
    
    # Handle cover image upload if base64 or file
    try:
        if cover_image_url and cover_image_url.startswith("data:image/"):
            res = handle_base64_upload(cover_image_url, title, "Cover Image")
            if res:
                cover_image_url = res['public_url']
                cover_image_metadata = res
        elif 'cover_image_file' in request.files and request.files['cover_image_file'].filename != '':
            res = handle_file_upload(request.files['cover_image_file'], title, "Cover Image")
            if res:
                cover_image_url = res['public_url']
                cover_image_metadata = res
    except Exception as e:
        print(f"Error uploading cover image: {e}")
        return jsonify({"success": False, "error": f"Image upload failed: {str(e)}"}), 400
            
    # Handle gallery upload if present
    gallery = []
    if 'gallery_files' in request.files:
        try:
            for file in request.files.getlist('gallery_files'):
                if file.filename != '':
                    res = handle_file_upload(file, title, "Gallery")
                    if res:
                        gallery.append(res['public_url'])
        except Exception as e:
            print(f"Error uploading gallery file: {e}")
            return jsonify({"success": False, "error": f"Gallery upload failed: {str(e)}"}), 400
    elif data.get('gallery'):
        try:
            gallery = json.loads(data.get('gallery'))
        except:
            gallery = []
            
    # Handle documents upload if present
    documents = []
    if 'document_files' in request.files:
        try:
            for file in request.files.getlist('document_files'):
                if file.filename != '':
                    res = handle_file_upload(file, title, "Documents")
                    if res:
                        documents.append(res['public_url'])
        except Exception as e:
            print(f"Error uploading document file: {e}")
            return jsonify({"success": False, "error": f"Document upload failed: {str(e)}"}), 400
    elif data.get('documents'):
        try:
            documents = json.loads(data.get('documents'))
        except:
            documents = []
            
    status = data.get('status', 'Draft')
    published_date = datetime.datetime.now().isoformat() if status == 'Published' else None
    
    # Save to db (open fresh connection)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO projects (
            id, slug, title, short_description, full_description, avenue, date, time, venue, 
            google_map_location, chief_guest, project_lead, volunteers, sponsors, partners, 
            budget, funds_raised, beneficiaries, impact, gallery, cover_image, documents, videos, 
            status, created_by, created_date, last_updated, published_date, is_deleted,
            cover_image_drive_id, cover_image_url, cover_image_filename, cover_image_mime_type, cover_image_uploaded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    """, (
        proj_id,
        slug,
        title,
        data.get('short_description', ''),
        data.get('full_description', ''),
        data.get('avenue', 'Community Service'),
        data.get('date', datetime.date.today().isoformat()),
        data.get('time', ''),
        data.get('venue', ''),
        data.get('google_map_location', ''),
        data.get('chief_guest', ''),
        data.get('project_lead', ''),
        json.dumps(data.get('volunteers', '').split(',') if data.get('volunteers') else []),
        json.dumps(data.get('sponsors', '').split(',') if data.get('sponsors') else []),
        json.dumps(data.get('partners', '').split(',') if data.get('partners') else []),
        int(data.get('budget', 0)),
        int(data.get('funds_raised', 0)),
        int(data.get('beneficiaries', 0)),
        int(data.get('impact', 0)),
        json.dumps(gallery),
        cover_image_url,
        json.dumps(documents),
        json.dumps(data.get('videos', '').split(',') if data.get('videos') else []),
        status,
        data.get('created_by', 'Admin'),
        datetime.datetime.now().isoformat(),
        datetime.datetime.now().isoformat(),
        published_date,
        cover_image_metadata['drive_file_id'],
        cover_image_metadata['public_url'],
        cover_image_metadata['filename'],
        cover_image_metadata['mime_type'],
        cover_image_metadata['uploaded_at']
    ))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "id": proj_id, "slug": slug})

# PUT /api/projects/:id
@app.route('/api/projects/<proj_id>', methods=['PUT', 'POST']) # Handle post forms spoofed as put
def update_project(proj_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM projects WHERE id = ?", (proj_id,))
    existing = c.fetchone()
    conn.close() # Close immediately before doing network requests!
    
    if not existing:
        return jsonify({"error": "Project not found"}), 404
        
    data = request.form.to_dict()
    title = data.get('title', existing[2])
    
    # Existing metadata mapping
    cover_image_metadata = {
        'drive_file_id': existing[30] if len(existing) > 30 else None,
        'public_url': existing[31] if len(existing) > 31 else None,
        'filename': existing[32] if len(existing) > 32 else None,
        'mime_type': existing[33] if len(existing) > 33 else None,
        'uploaded_at': existing[34] if len(existing) > 34 else None
    }
    
    # Handle files
    cover_image_url = data.get('cover_image', existing[20])
    try:
        new_res = None
        if cover_image_url and cover_image_url.startswith("data:image/"):
            new_res = handle_base64_upload(cover_image_url, title, "Cover Image")
        elif 'cover_image_file' in request.files and request.files['cover_image_file'].filename != '':
            new_res = handle_file_upload(request.files['cover_image_file'], title, "Cover Image")
            
        if new_res:
            old_drive_id = existing[30] if len(existing) > 30 else None
            if old_drive_id:
                try:
                    service = get_drive_service()
                    if service:
                        service.files().delete(fileId=old_drive_id).execute()
                        print(f"Deleted old cover image file {old_drive_id} from Google Drive.")
                except Exception as de:
                    print(f"Warning: Could not delete old cover image {old_drive_id}: {de}")
            
            cover_image_url = new_res['public_url']
            cover_image_metadata = new_res
    except Exception as e:
        import traceback, sys
        print(f"Error uploading cover image in update_project:", flush=True)
        traceback.print_exc(file=sys.stdout)
        sys.stdout.flush()
        return jsonify({"success": False, "error": f"Image upload failed: {str(e)}"}), 400
            
    # Gallery
    gallery = []
    if 'gallery_files' in request.files:
        try:
            for file in request.files.getlist('gallery_files'):
                if file.filename != '':
                    res = handle_file_upload(file, title, "Gallery")
                    if res:
                        gallery.append(res['public_url'])
            ex_gallery = json.loads(existing[19]) if existing[19] else []
            gallery = ex_gallery + gallery
        except Exception as e:
            print(f"Error uploading gallery file: {e}")
            return jsonify({"success": False, "error": f"Gallery upload failed: {str(e)}"}), 400
    elif data.get('gallery'):
        try:
            gallery = json.loads(data.get('gallery'))
        except:
            gallery = []
    else:
        try:
            gallery = json.loads(existing[19]) if existing[19] else []
        except:
            gallery = []
            
    # Documents
    documents = []
    if 'document_files' in request.files:
        try:
            for file in request.files.getlist('document_files'):
                if file.filename != '':
                    res = handle_file_upload(file, title, "Documents")
                    if res:
                        documents.append(res['public_url'])
            ex_docs = json.loads(existing[21]) if existing[21] else []
            documents = ex_docs + documents
        except Exception as e:
            print(f"Error uploading document file: {e}")
            return jsonify({"success": False, "error": f"Document upload failed: {str(e)}"}), 400
    elif data.get('documents'):
        try:
            documents = json.loads(data.get('documents'))
        except:
            documents = []
    else:
        try:
            documents = json.loads(existing[21]) if existing[21] else []
        except:
            documents = []
            
    status = data.get('status', existing[23])
    published_date = existing[27]
    if status == 'Published' and not published_date:
        published_date = datetime.datetime.now().isoformat()
        
    # Update statement (open fresh connection)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        UPDATE projects SET 
            title=?, short_description=?, full_description=?, avenue=?, date=?, time=?, venue=?, 
            google_map_location=?, chief_guest=?, project_lead=?, volunteers=?, sponsors=?, partners=?, 
            budget=?, funds_raised=?, beneficiaries=?, impact=?, gallery=?, cover_image=?, documents=?, videos=?, 
            status=?, last_updated=?, published_date=?,
            cover_image_drive_id=?, cover_image_url=?, cover_image_filename=?, cover_image_mime_type=?, cover_image_uploaded_at=?
        WHERE id = ?
    """, (
        title,
        data.get('short_description', existing[3]),
        data.get('full_description', existing[4]),
        data.get('avenue', existing[5]),
        data.get('date', existing[6]),
        data.get('time', existing[7]),
        data.get('venue', existing[8]),
        data.get('google_map_location', existing[9]),
        data.get('chief_guest', existing[10]),
        data.get('project_lead', existing[11]),
        json.dumps(data.get('volunteers', '').split(',') if data.get('volunteers') else (json.loads(existing[12]) if existing[12] else [])),
        json.dumps(data.get('sponsors', '').split(',') if data.get('sponsors') else (json.loads(existing[13]) if existing[13] else [])),
        json.dumps(data.get('partners', '').split(',') if data.get('partners') else (json.loads(existing[14]) if existing[14] else [])),
        int(data.get('budget', existing[15] or 0)),
        int(data.get('funds_raised', existing[16] or 0)),
        int(data.get('beneficiaries', existing[17] or 0)),
        int(data.get('impact', existing[18] or 0)),
        json.dumps(gallery),
        cover_image_url,
        json.dumps(documents),
        json.dumps(data.get('videos', '').split(',') if data.get('videos') else (json.loads(existing[22]) if existing[22] else [])),
        status,
        datetime.datetime.now().isoformat(),
        published_date,
        cover_image_metadata['drive_file_id'],
        cover_image_metadata['public_url'],
        cover_image_metadata['filename'],
        cover_image_metadata['mime_type'],
        cover_image_metadata['uploaded_at'],
        proj_id
    ))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True})

def delete_drive_folder_by_name(project_name):
    try:
        service = get_drive_service()
        if not service:
            return
        parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        q_projects = f"name = 'Projects' and mimeType = 'application/vnd.google-apps.folder' and '{parent_folder_id}' in parents and trashed = false"
        res_projects = service.files().list(q=q_projects, fields="files(id)").execute()
        files_projects = res_projects.get('files', [])
        if not files_projects:
            return
        projects_id = files_projects[0]['id']
        
        q_folder = f"name = '{project_name}' and mimeType = 'application/vnd.google-apps.folder' and '{projects_id}' in parents and trashed = false"
        res_folder = service.files().list(q=q_folder, fields="files(id)").execute()
        files_folder = res_folder.get('files', [])
        for f in files_folder:
            service.files().delete(fileId=f['id']).execute()
            print(f"Deleted Google Drive folder {f['id']} for project '{project_name}'")
    except Exception as e:
        print(f"Error deleting Google Drive folder for project '{project_name}': {e}")

# DELETE /api/projects/:id
@app.route('/api/projects/<proj_id>', methods=['DELETE'])
def delete_project(proj_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT is_deleted, title FROM projects WHERE id = ?", (proj_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return jsonify({"error": "Project not found"}), 404
        
    is_deleted, title = row[0], row[1]
    
    # Delete folder from Google Drive immediately on both soft and permanent delete!
    if title:
        delete_drive_folder_by_name(title)
        
    if is_deleted == 1:
        # Permanent delete
        c.execute("DELETE FROM projects WHERE id = ?", (proj_id,))
        print(f"Project {proj_id} permanently deleted.")
    else:
        # Soft delete (move to Trash)
        c.execute("UPDATE projects SET is_deleted = 1, deleted_at = ? WHERE id = ?", (datetime.datetime.now().isoformat(), proj_id))
        print(f"Project {proj_id} moved to trash.")
        
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# POST /api/projects/:id/restore
@app.route('/api/projects/<proj_id>/restore', methods=['POST'])
def restore_project(proj_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE projects SET is_deleted = 0, deleted_at = NULL WHERE id = ?", (proj_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# Google Calendar Helpers & Integration wrappers
def get_calendar_service():
    if not os.path.exists(GOOGLE_CREDENTIALS_PATH):
        return None
    try:
        import httplib2
        import google_auth_httplib2
        from googleapiclient.discovery import build
        from google.oauth2 import service_account
        
        creds = service_account.Credentials.from_service_account_file(
            GOOGLE_CREDENTIALS_PATH, 
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        def build_request(http, *args, **kwargs):
            new_http = google_auth_httplib2.AuthorizedHttp(creds, http=httplib2.Http())
            return googleapiclient.http.HttpRequest(new_http, *args, **kwargs)
            
        return build('calendar', 'v3', credentials=creds, requestBuilder=build_request)
    except Exception as e:
        print(f"Error building thread-safe calendar service: {e}")
        return None

def get_google_calendar_id():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT value FROM settings WHERE key = 'google_calendar_id'")
        row = c.fetchone()
        conn.close()
        if row and row[0].strip():
            return row[0].strip()
    except Exception as e:
        print(f"Error getting calendar ID setting: {e}")
    return None

def sync_event_to_google_calendar(event_id, event_data):
    calendar_id = get_google_calendar_id()
    if not calendar_id:
        return None, "No calendar ID configured."
        
    service = get_calendar_service()
    if not service:
        return None, "Google Calendar service not initialized."
        
    date_val = event_data.get('date')
    time_val = event_data.get('time', '18:00')
    if not date_val:
        return None, "No event date provided."
        
    try:
        if not time_val:
            time_val = '18:00'
        dt_str = f"{date_val}T{time_val}:00"
        start_dt = datetime.datetime.fromisoformat(dt_str)
        end_dt = start_dt + datetime.timedelta(hours=1.5)
        
        start_time_iso = start_dt.isoformat()
        end_time_iso = end_dt.isoformat()
    except Exception as te:
        print(f"Error parsing date/time for Google Calendar: {te}")
        start_time_iso = date_val
        end_time_iso = date_val
        
    body = {
        'summary': event_data.get('name', 'Event'),
        'location': event_data.get('venue', ''),
        'description': event_data.get('description', ''),
        'start': {
            'dateTime': start_time_iso if 'T' in start_time_iso else None,
            'date': start_time_iso if 'T' not in start_time_iso else None,
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': end_time_iso if 'T' in end_time_iso else None,
            'date': end_time_iso if 'T' not in end_time_iso else None,
            'timeZone': 'Asia/Kolkata',
        }
    }
    
    google_event_id = event_data.get('google_event_id')
    try:
        if google_event_id:
            event = service.events().update(calendarId=calendar_id, eventId=google_event_id, body=body).execute()
            print(f"Updated Google Calendar event {google_event_id}")
            return google_event_id, None
        else:
            event = service.events().insert(calendarId=calendar_id, body=body).execute()
            new_id = event.get('id')
            print(f"Created new Google Calendar event {new_id}")
            return new_id, None
    except Exception as e:
        err_str = str(e)
        if google_event_id and "404" in err_str:
            try:
                event = service.events().insert(calendarId=calendar_id, body=body).execute()
                new_id = event.get('id')
                print(f"Re-created missing Google Calendar event {new_id}")
                return new_id, None
            except Exception as e2:
                err_str = str(e2)
        print(f"Google Calendar sync error: {err_str}")
        return None, err_str

def delete_event_from_google_calendar(google_event_id):
    if not google_event_id:
        return
    calendar_id = get_google_calendar_id()
    if not calendar_id:
        return
    service = get_calendar_service()
    if not service:
        return
    try:
        service.events().delete(calendarId=calendar_id, eventId=google_event_id).execute()
        print(f"Deleted Google Calendar event {google_event_id}")
    except Exception as e:
        print(f"Error deleting Google Calendar event {google_event_id}: {e}")

# GET /api/events
@app.route('/api/events', methods=['GET'])
def get_events():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM events ORDER BY date ASC, id ASC")
    rows = c.fetchall()
    conn.close()
    
    events_list = [dict(r) for r in rows]
    return jsonify(events_list)

# POST /api/events
@app.route('/api/events', methods=['POST'])
def create_event():
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
        
    name = data.get('name', 'New Event')
    date_val = data.get('date', '')
    time_val = data.get('time', '18:00')
    venue = data.get('venue', '')
    registrations = int(data.get('registrations', 0))
    budget = int(data.get('budget', 0))
    status = data.get('status', 'Upcoming')
    attendance = int(data.get('attendance', 0))
    category = data.get('category', 'meeting')
    description = data.get('description', '')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM events")
    rows = c.fetchall()
    max_num = 200
    for r in rows:
        eid = r[0]
        if eid.startswith("EVT-"):
            try:
                num = int(eid.split("-")[1])
                if num > max_num:
                    max_num = num
            except:
                pass
    next_id = f"EVT-{max_num + 1}"
    conn.close()
    
    google_event_id = None
    g_err = None
    try:
        event_payload = {
            'name': name,
            'date': date_val,
            'time': time_val,
            'venue': venue,
            'description': description
        }
        g_id, g_err = sync_event_to_google_calendar(next_id, event_payload)
        if g_id:
            google_event_id = g_id
    except Exception as ge:
        g_err = str(ge)
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO events (id, name, date, time, venue, registrations, budget, status, attendance, category, description, google_event_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (next_id, name, date_val, time_val, venue, registrations, budget, status, attendance, category, description, google_event_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True, 
        "id": next_id, 
        "google_event_id": google_event_id,
        "google_sync": google_event_id is not None,
        "google_sync_error": g_err
    })

# PUT /api/events/:id
@app.route('/api/events/<evt_id>', methods=['PUT', 'POST'])
def update_event(evt_id):
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM events WHERE id = ?", (evt_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        return jsonify({"error": "Event not found"}), 404
        
    existing = dict(row)
    
    name = data.get('name', existing['name'])
    date_val = data.get('date', existing['date'])
    time_val = data.get('time', existing['time'])
    venue = data.get('venue', existing['venue'])
    registrations = int(data.get('registrations', existing['registrations']))
    budget = int(data.get('budget', existing['budget']))
    status = data.get('status', existing['status'])
    attendance = int(data.get('attendance', existing['attendance']))
    category = data.get('category', existing['category'])
    description = data.get('description', existing['description'])
    google_event_id = existing.get('google_event_id')
    
    g_err = None
    try:
        event_payload = {
            'name': name,
            'date': date_val,
            'time': time_val,
            'venue': venue,
            'description': description,
            'google_event_id': google_event_id
        }
        g_id, g_err = sync_event_to_google_calendar(evt_id, event_payload)
        if g_id:
            google_event_id = g_id
    except Exception as ge:
        g_err = str(ge)
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        UPDATE events 
        SET name = ?, date = ?, time = ?, venue = ?, registrations = ?, budget = ?, status = ?, attendance = ?, category = ?, description = ?, google_event_id = ?
        WHERE id = ?
    """, (name, date_val, time_val, venue, registrations, budget, status, attendance, category, description, google_event_id, evt_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True, 
        "id": evt_id,
        "google_event_id": google_event_id,
        "google_sync": google_event_id is not None,
        "google_sync_error": g_err
    })

# DELETE /api/events/<evt_id>
@app.route('/api/events/<evt_id>', methods=['DELETE'])
def delete_event(evt_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT google_event_id FROM events WHERE id = ?", (evt_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Event not found"}), 404
        
    google_event_id = row['google_event_id']
    c.execute("DELETE FROM events WHERE id = ?", (evt_id,))
    conn.commit()
    conn.close()
    
    if google_event_id:
        try:
            delete_event_from_google_calendar(google_event_id)
        except Exception as e:
            print(f"Error syncing deletion to Google Calendar: {e}")
            
    return jsonify({"success": True})

# GET /api/settings
@app.route('/api/settings', methods=['GET'])
def get_settings():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT key, value FROM settings")
    rows = c.fetchall()
    conn.close()
    
    settings_dict = {r[0]: r[1] for r in rows}
    return jsonify(settings_dict)

# POST /api/settings
@app.route('/api/settings', methods=['POST'])
def save_settings():
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    for key, value in data.items():
        c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True})

# Helper: get sheets service
def get_sheets_service():
    import httplib2
    try:
        creds = load_credentials(['https://www.googleapis.com/auth/drive'])
        if not creds:
            raise Exception("No credentials available.")
        import google_auth_httplib2
        new_http = google_auth_httplib2.AuthorizedHttp(creds, http=httplib2.Http())
        from googleapiclient.discovery import build
        return build('sheets', 'v4', http=new_http)
    except Exception as e:
        print(f"Error building sheets service: {e}")
        return None

# Helper: get or create Google Sheet in Finance folder
def get_or_create_finance_sheet():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT value FROM settings WHERE key = 'google_finance_spreadsheet_id'")
    row = c.fetchone()
    spreadsheet_id = row[0] if row else None
    
    drive_service = get_drive_service()
    if not drive_service:
        conn.close()
        return None
        
    sheets_service = get_sheets_service()
    if not sheets_service:
        conn.close()
        return None
        
    if spreadsheet_id:
        try:
            drive_service.files().get(fileId=spreadsheet_id).execute()
            # Re-ensure sharing permissions are set
            res_meta = drive_service.files().get(fileId=spreadsheet_id, fields='parents').execute()
            parents = res_meta.get('parents', [])
            if parents:
                finance_folder_id = parents[0]
                try:
                    drive_service.permissions().create(fileId=finance_folder_id, body={'type': 'anyone', 'role': 'writer'}).execute()
                except Exception as pe:
                    print(f"Error re-setting permission on folder: {pe}")
            try:
                drive_service.permissions().create(fileId=spreadsheet_id, body={'type': 'anyone', 'role': 'writer'}).execute()
            except Exception as pe:
                print(f"Error re-setting permission on spreadsheet: {pe}")
        except Exception:
            spreadsheet_id = None
            
    if not spreadsheet_id:
        parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        
        def _get_or_create_folder(name, parent_id):
            q = f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
            res = drive_service.files().list(q=q, fields="files(id)").execute()
            files = res.get('files', [])
            if files:
                return files[0]['id']
            else:
                meta = {
                    'name': name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [parent_id]
                }
                folder = drive_service.files().create(body=meta, fields='id').execute()
                return folder.get('id')
                
        try:
            finance_folder_id = _get_or_create_folder("Finance", parent_folder_id)
            body = {
                'name': 'Rotaract Warriors Finance Ledger',
                'mimeType': 'application/vnd.google-apps.spreadsheet',
                'parents': [finance_folder_id]
            }
            file = drive_service.files().create(body=body, fields='id').execute()
            spreadsheet_id = file.get('id')
            
            c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('google_finance_spreadsheet_id', ?)", (spreadsheet_id,))
            conn.commit()
            
            # Set sharing permissions
            try:
                drive_service.permissions().create(fileId=finance_folder_id, body={'type': 'anyone', 'role': 'writer'}).execute()
            except Exception as pe:
                print(f"Error setting permission on folder: {pe}")
            try:
                drive_service.permissions().create(fileId=spreadsheet_id, body={'type': 'anyone', 'role': 'writer'}).execute()
            except Exception as pe:
                print(f"Error setting permission on spreadsheet: {pe}")
                
            header = ['Transaction ID', 'Description', 'Category', 'Flow Type', 'Date', 'Amount (INR)', 'Reference Note', 'Audit Status', 'Deleted By', 'Deleted Reason', 'Deletion Date', 'Invoice Image Link']
            sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range="Sheet1!A1:L1",
                valueInputOption="RAW",
                body={"values": [header]}
            ).execute()
        except Exception as e:
            print(f"Error creating Google Sheet: {e}")
            conn.close()
            return None
            
    conn.close()
    return spreadsheet_id

# GET /api/finances
@app.route('/api/finances', methods=['GET'])
def get_finances():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM finances")
    if c.fetchone()[0] == 0:
        # DB is empty, recover active transactions from Google Sheets memory
        try:
            spreadsheet_id = get_or_create_finance_sheet()
            if spreadsheet_id:
                sheets_service = get_sheets_service()
                res = sheets_service.spreadsheets().values().get(
                    spreadsheetId=spreadsheet_id,
                    range="Sheet1!A:L"
                ).execute()
                rows = res.get('values', [])
                if len(rows) > 1:
                    recovered = []
                    for row in rows[1:]:
                        if not row or len(row) == 0:
                            continue
                        if len(row) >= 8 and row[7] == 'Deleted':
                            continue
                        txn_id = row[0]
                        desc = row[1] if len(row) > 1 else ''
                        category = row[2] if len(row) > 2 else ''
                        flow_type = row[3] if len(row) > 3 else 'Income'
                        date = row[4] if len(row) > 4 else ''
                        amount = int(row[5]) if len(row) > 5 and str(row[5]).isdigit() else 0
                        ref_note = row[6] if len(row) > 6 else ''
                        invoice_url = row[11] if len(row) > 11 else ''
                        
                        recovered.append((txn_id, desc, category, flow_type, amount, date, ref_note, invoice_url))
                    
                    if recovered:
                        c.executemany("""
                            INSERT INTO finances (id, description, category, type, amount, date, reference_note, invoice_url)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, recovered)
                        conn.commit()
        except Exception as e:
            print(f"Error recovering from Google Sheet memory: {e}")

    c.execute("SELECT id, description, category, type, amount, date, reference_note, invoice_url FROM finances ORDER BY date DESC, id DESC")
    rows = c.fetchall()
    conn.close()
    
    finances_list = []
    for r in rows:
        finances_list.append({
            "id": r["id"],
            "desc": r["description"],
            "category": r["category"],
            "type": r["type"],
            "amount": r["amount"],
            "date": r["date"],
            "reference_note": r["reference_note"] or "",
            "invoice_url": r["invoice_url"] or ""
        })
    return jsonify(finances_list)

# POST /api/finances
@app.route('/api/finances', methods=['POST'])
def add_finance():
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
        
    desc = data.get('desc', '')
    category = data.get('category', '')
    flow_type = data.get('type', 'Income')
    amount = int(data.get('amount', 0))
    date = data.get('date', datetime.date.today().isoformat())
    reference_note = data.get('reference_note', '')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("SELECT id FROM finances")
    ids = c.fetchall()
    max_num = 500
    for row in ids:
        val = row[0]
        if val.startswith('TXN-'):
            try:
                num = int(val.split('-')[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    next_id = f"TXN-{max_num + 1}"
    
    invoice_image = data.get('invoice_image', '')
    invoice_url = ''
    invoice_drive_id = ''
    if invoice_image:
        uploaded = handle_invoice_upload(invoice_image)
        if uploaded:
            invoice_url = uploaded.get('public_url', '')
            invoice_drive_id = uploaded.get('drive_file_id', '')
            
    c.execute("""
        INSERT INTO finances (id, description, category, type, amount, date, reference_note, invoice_url, invoice_drive_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (next_id, desc, category, flow_type, amount, date, reference_note, invoice_url, invoice_drive_id))
    
    conn.commit()
    conn.close()
    
    # Sync append to Google Sheet
    try:
        spreadsheet_id = get_or_create_finance_sheet()
        if spreadsheet_id:
            sheets_service = get_sheets_service()
            row = [next_id, desc, category, flow_type, date, amount, reference_note, 'Active', '', '', '', invoice_url]
            sheets_service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range="Sheet1!A:A",
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body={"values": [row]}
            ).execute()
    except Exception as e:
        print(f"Error syncing transaction append to Google Sheet: {e}")
        
    return jsonify({"success": True, "id": next_id})

# DELETE /api/finances/<txn_id>
@app.route('/api/finances/<txn_id>', methods=['DELETE'])
def delete_finance(txn_id):
    reason = "No reason specified"
    deleted_by = "Anonymous Admin"
    
    # Parse reason and username from request
    try:
        if request.is_json:
            data = request.json
            reason = data.get('reason', reason)
            deleted_by = data.get('deleted_by', deleted_by)
        else:
            reason = request.args.get('reason', reason)
            deleted_by = request.args.get('deleted_by', deleted_by)
    except Exception:
        pass
        
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM finances WHERE id = ?", (txn_id,))
    conn.commit()
    conn.close()
    
    # Sync deletion details update to Google Sheet
    try:
        spreadsheet_id = get_or_create_finance_sheet()
        if spreadsheet_id:
            sheets_service = get_sheets_service()
            res = sheets_service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range="Sheet1!A:A"
            ).execute()
            col_a = res.get('values', [])
            
            row_idx = -1
            for idx, val_list in enumerate(col_a):
                if val_list and val_list[0] == txn_id:
                    row_idx = idx
                    break
                    
            if row_idx != -1:
                range_to_update = f"Sheet1!H{row_idx + 1}:K{row_idx + 1}"
                body = {
                    "values": [['Deleted', deleted_by, reason, datetime.date.today().isoformat()]]
                }
                sheets_service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range=range_to_update,
                    valueInputOption="RAW",
                    body=body
                ).execute()
    except Exception as e:
        print(f"Error syncing deletion update to Google Sheet: {e}")
        
    return jsonify({"success": True})

# Helper: Upload gallery photo to Google Drive inside "Echoes of the Warriors Cloud" folder
def handle_gallery_upload(base64_str):
    if not base64_str or not base64_str.startswith("data:image/"):
        return None
        
    header, encoded = base64_str.split(",", 1)
    file_extension = header.split(";")[0].split("/")[1]
    if file_extension == "jpeg":
        file_extension = "jpg"
        
    mime_type = "image/png"
    if file_extension == "jpg":
        mime_type = "image/jpeg"
        
    try:
        import base64
        data = base64.b64decode(encoded)
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None
        
    filename = f"gallery_{int(datetime.datetime.now().timestamp())}.{file_extension}"
    
    if not has_google_drive:
        # Fallback to local uploads directory
        local_path = os.path.join(UPLOADS_DIR, filename)
        with open(local_path, "wb") as f:
            f.write(data)
        return {"drive_file_id": f"/uploads/{filename}", "public_url": f"/uploads/{filename}"}
        
    service = get_drive_service()
    if not service:
        return None
        
    parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
    
    try:
        def _get_or_create_folder(name, parent_id):
            q = f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
            res = service.files().list(q=q, fields="files(id)").execute()
            files = res.get('files', [])
            if files:
                return files[0]['id']
            else:
                meta = {
                    'name': name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [parent_id]
                }
                folder = service.files().create(body=meta, fields='id').execute()
                try:
                    service.permissions().create(fileId=folder.get('id'), body={'type': 'anyone', 'role': 'writer'}).execute()
                except Exception as pe:
                    print(f"Error setting public folder permissions: {pe}")
                return folder.get('id')
                
        gallery_folder_id = _get_or_create_folder("Echoes of the Warriors Cloud", parent_folder_id)
        
        file_metadata = {
            'name': filename,
            'parents': [gallery_folder_id]
        }
        
        import io
        from googleapiclient.http import MediaIoBaseUpload
        
        fh = io.BytesIO(data)
        media = MediaIoBaseUpload(fh, mimetype=mime_type, resumable=True)
        uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        file_id = uploaded_file.get('id')
        
        try:
            service.permissions().create(fileId=file_id, body={'type': 'anyone', 'role': 'reader'}).execute()
        except:
            pass
            
        public_url = f"/api/project-image/{file_id}"
        return {"drive_file_id": file_id, "public_url": public_url}
    except Exception as e:
        print(f"Error uploading gallery photo to Drive: {e}")
        return None

def handle_invoice_upload(base64_str):
    if not base64_str or not base64_str.startswith("data:image/"):
        return None
        
    header, encoded = base64_str.split(",", 1)
    file_extension = header.split(";")[0].split("/")[1]
    if file_extension == "jpeg":
        file_extension = "jpg"
        
    mime_type = "image/png"
    if file_extension == "jpg":
        mime_type = "image/jpeg"
        
    try:
        import base64
        data = base64.b64decode(encoded)
    except Exception as e:
        print(f"Error decoding base64 invoice image: {e}")
        return None
        
    filename = f"invoice_{int(datetime.datetime.now().timestamp())}.{file_extension}"
    
    if not has_google_drive:
        # Fallback to local uploads directory
        local_path = os.path.join(UPLOADS_DIR, filename)
        with open(local_path, "wb") as f:
            f.write(data)
        return {"drive_file_id": f"/uploads/{filename}", "public_url": f"/uploads/{filename}"}
        
    service = get_drive_service()
    if not service:
        return None
        
    parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
    
    try:
        def _get_or_create_folder(name, parent_id):
            q = f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
            res = service.files().list(q=q, fields="files(id)").execute()
            files = res.get('files', [])
            if files:
                return files[0]['id']
            else:
                meta = {
                    'name': name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [parent_id]
                }
                folder = service.files().create(body=meta, fields='id').execute()
                try:
                    service.permissions().create(fileId=folder.get('id'), body={'type': 'anyone', 'role': 'writer'}).execute()
                except Exception as pe:
                    print(f"Error setting public folder permissions: {pe}")
                return folder.get('id')
                
        finance_folder_id = _get_or_create_folder("Finance", parent_folder_id)
        
        file_metadata = {
            'name': filename,
            'parents': [finance_folder_id]
        }
        
        import io
        from googleapiclient.http import MediaIoBaseUpload
        
        fh = io.BytesIO(data)
        media = MediaIoBaseUpload(fh, mimetype=mime_type, resumable=True)
        uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        file_id = uploaded_file.get('id')
        
        try:
            service.permissions().create(fileId=file_id, body={'type': 'anyone', 'role': 'reader'}).execute()
        except:
            pass
            
        public_url = f"/api/project-image/{file_id}"
        return {"drive_file_id": file_id, "public_url": public_url}
    except Exception as e:
        print(f"Error uploading invoice photo to Drive: {e}")
        return None

# GET /api/gallery
@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, google_drive_id, description, date FROM gallery ORDER BY date DESC, id DESC")
    rows = c.fetchall()
    conn.close()
    
    gallery_list = []
    for r in rows:
        file_id = r["google_drive_id"]
        # If it is a full local path or Unsplash URL or starts with uploads/
        if file_id.startswith("http") or file_id.startswith("assets/") or file_id.startswith("/uploads/"):
            src = file_id
        else:
            src = f"/api/project-image/{file_id}"
            
        gallery_list.append({
            "id": r["id"],
            "src": src,
            "drive_file_id": file_id,
            "alt": r["description"],
            "date": r["date"]
        })
    return jsonify(gallery_list)

# POST /api/gallery
@app.route('/api/gallery', methods=['POST'])
def add_gallery_photo():
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
        
    image_base64 = data.get('image', '')
    caption = data.get('caption', '')
    date = data.get('date', datetime.date.today().isoformat())
    
    res = handle_gallery_upload(image_base64)
    if not res:
        return jsonify({"error": "Failed to upload image to Google Drive folder"}), 500
        
    drive_file_id = res["drive_file_id"]
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("SELECT id FROM gallery")
    ids = c.fetchall()
    max_num = 300
    for row in ids:
        val = row[0]
        if val.startswith('IMG-'):
            try:
                num = int(val.split('-')[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    next_id = f"IMG-{max_num + 1}"
    
    c.execute("INSERT INTO gallery (id, google_drive_id, description, date) VALUES (?, ?, ?, ?)",
              (next_id, drive_file_id, caption, date))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "id": next_id, "src": res["public_url"]})

# DELETE /api/gallery/<photo_id>
@app.route('/api/gallery/<photo_id>', methods=['DELETE'])
def delete_gallery_photo(photo_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT google_drive_id FROM gallery WHERE id = ?", (photo_id,))
    row = c.fetchone()
    drive_file_id = row[0] if row else None
    
    c.execute("DELETE FROM gallery WHERE id = ?", (photo_id,))
    conn.commit()
    conn.close()
    
    # Remove from Google Drive
    if drive_file_id and has_google_drive and not drive_file_id.startswith("http") and not drive_file_id.startswith("assets/") and not drive_file_id.startswith("/uploads/"):
        try:
            service = get_drive_service()
            if service:
                service.files().delete(fileId=drive_file_id).execute()
        except Exception as e:
            print(f"Error deleting file {drive_file_id} from Drive: {e}")
            
    return jsonify({"success": True})

# Helper: Upload MoM PDF to Google Drive
def upload_mom_pdf(number, pdf_base64):
    if not has_google_drive:
        return None
        
    try:
        import io
        import base64
        from googleapiclient.http import MediaIoBaseUpload
        
        service = get_drive_service()
        if not service:
            return None
            
        parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        
        def _get_or_create_folder(name, parent_id):
            q = f"name = '{name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
            res = service.files().list(q=q, fields="files(id)").execute()
            files = res.get('files', [])
            if files:
                return files[0]['id']
            
            meta = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_id]
            }
            folder = service.files().create(body=meta, fields='id').execute()
            try:
                service.permissions().create(fileId=folder.get('id'), body={'type': 'anyone', 'role': 'writer'}).execute()
            except Exception as pe:
                print(f"Error setting public folder permissions: {pe}")
            return folder.get('id')
            
        mom_folder_id = _get_or_create_folder("Rotaract Warriors MoM Records", parent_folder_id)
        
        filename = f"MoM_{number.replace('/', '_')}.pdf"
        
        q_file = f"name = '{filename}' and '{mom_folder_id}' in parents and trashed = false"
        res_file = service.files().list(q=q_file, fields="files(id)").execute()
        existing_files = res_file.get('files', [])
        
        pdf_data = base64.b64decode(pdf_base64)
        fh = io.BytesIO(pdf_data)
        media = MediaIoBaseUpload(fh, mimetype='application/pdf', resumable=True)
        
        if existing_files:
            file_id = existing_files[0]['id']
            file = service.files().update(fileId=file_id, media_body=media).execute()
        else:
            file_metadata = {
                'name': filename,
                'parents': [mom_folder_id]
            }
            file = service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()
            file_id = file.get('id')
            try:
                service.permissions().create(fileId=file_id, body={'type': 'anyone', 'role': 'reader'}).execute()
            except Exception as pe:
                print(f"Error setting public file permissions: {pe}")
                
        f_info = service.files().get(fileId=file_id, fields="webViewLink").execute()
        return {
            "drive_file_id": file_id,
            "public_url": f_info.get("webViewLink")
        }
    except Exception as e:
        print(f"Error uploading MoM PDF to Drive: {e}")
        return None

# Helper: Synchronize SQLite members data to Google Sheet
def sync_members_to_google_sheet():
    if not has_google_drive:
        return None
        
    try:
        from googleapiclient.discovery import build
        
        service = get_drive_service()
        if not service:
            return None
            
        # Get credentials dynamically
        creds = service._http.credentials
        sheets_service = build('sheets', 'v4', credentials=creds)
        
        parent_folder_id = "1T8hbhitiCOH0E5ZzC2vzCkMrcDQtSbKo"
        
        # Search for sheet
        q = f"name = 'Rotaract Warriors Members Registry' and mimeType = 'application/vnd.google-apps.spreadsheet' and '{parent_folder_id}' in parents and trashed = false"
        res = service.files().list(q=q, fields="files(id, webViewLink)").execute()
        files = res.get('files', [])
        
        if files:
            spreadsheet_id = files[0]['id']
            link = files[0]['webViewLink']
        else:
            spreadsheet_metadata = {
                'name': 'Rotaract Warriors Members Registry',
                'mimeType': 'application/vnd.google-apps.spreadsheet',
                'parents': [parent_folder_id]
            }
            file = service.files().create(body=spreadsheet_metadata, fields='id, webViewLink').execute()
            spreadsheet_id = file.get('id')
            link = file.get('webViewLink')
            
            # Set public read/write access so user can open/edit
            try:
                service.permissions().create(fileId=spreadsheet_id, body={'type': 'anyone', 'role': 'writer'}).execute()
            except Exception as pe:
                print(f"Error setting sheet public permission: {pe}")
                
        # 1. Clear existing sheet values in Sheet1!A1:J1000
        try:
            sheets_service.spreadsheets().values().clear(
                spreadsheetId=spreadsheet_id, range="Sheet1!A1:J1000"
            ).execute()
        except Exception as ce:
            print(f"Error clearing sheet range: {ce}")

        # 2. Query existing members from SQLite
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, photo, name, email, phone, role, position, status, payment, isSecretaryAdmin FROM members ORDER BY id ASC")
        final_rows = c.fetchall()
        conn.close()
        
        # 3. WRITE back final list to Google Sheets
        values = [
            ["Member ID", "Photo URL", "Name", "Email", "Phone", "Role", "Position", "Status", "Payment Status", "Is Secretary Admin"]
        ]
        for r in final_rows:
            values.append([
                r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], "Yes" if r[9] else "No"
            ])
            
        body = {
            'values': values
        }
        sheets_service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id, range="Sheet1!A1",
            valueInputOption="RAW", body=body).execute()
            
        print(f"Successfully synced members (Two-Way) to Google Sheet: {spreadsheet_id}")
        return link
    except Exception as e:
        print(f"Error syncing members to Google Sheet: {e}")
        return None

import threading
def trigger_background_sheet_sync():
    threading.Thread(target=sync_members_to_google_sheet).start()

# GET /api/members
@app.route('/api/members', methods=['GET'])
def get_members():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM members ORDER BY id ASC")
    rows = c.fetchall()
    conn.close()
    
    members_list = []
    for r in rows:
        members_list.append({
            "id": r["id"],
            "photo": r["photo"],
            "name": r["name"],
            "email": r["email"],
            "phone": r["phone"],
            "role": r["role"],
            "position": r["position"],
            "status": r["status"],
            "payment": r["payment"],
            "isSecretaryAdmin": bool(r["isSecretaryAdmin"])
        })
    return jsonify(members_list)

# POST /api/members
@app.route('/api/members', methods=['POST'])
def create_member():
    data = request.json or {}
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Generate auto-incrementing Member ID if not provided
    member_id = data.get('id', '')
    if not member_id:
        c.execute("SELECT id FROM members")
        ids = c.fetchall()
        max_num = 0
        for row in ids:
            val = row[0]
            if val.startswith('WR-'):
                try:
                    num = int(val.split('-')[1])
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
        member_id = f"WR-{str(max_num + 1).zfill(3)}"
        
    photo = data.get('photo', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150')
    name = data.get('name', '')
    email = data.get('email', '')
    phone = data.get('phone', '')
    role = data.get('role', 'Member')
    position = data.get('position', 'General Member')
    status = data.get('status', 'Active')
    payment = data.get('payment', 'Paid')
    is_sec = 1 if data.get('isSecretaryAdmin', False) else 0
    
    c.execute("""
        INSERT INTO members (id, photo, name, email, phone, role, position, status, payment, isSecretaryAdmin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (member_id, photo, name, email, phone, role, position, status, payment, is_sec))
    conn.commit()
    conn.close()
    
    trigger_background_sheet_sync()
    return jsonify({"success": True, "id": member_id})

# PUT /api/members/<member_id>
@app.route('/api/members/<member_id>', methods=['PUT'])
def update_member(member_id):
    data = request.json or {}
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    photo = data.get('photo')
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    role = data.get('role')
    position = data.get('position')
    status = data.get('status')
    payment = data.get('payment')
    is_sec = 1 if data.get('isSecretaryAdmin', False) else 0
    
    c.execute("""
        UPDATE members
        SET photo=?, name=?, email=?, phone=?, role=?, position=?, status=?, payment=?, isSecretaryAdmin=?
        WHERE id=?
    """, (photo, name, email, phone, role, position, status, payment, is_sec, member_id))
    conn.commit()
    conn.close()
    
    trigger_background_sheet_sync()
    return jsonify({"success": True})

# DELETE /api/members/<member_id>
@app.route('/api/members/<member_id>', methods=['DELETE'])
def delete_member(member_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM members WHERE id=?", (member_id,))
    conn.commit()
    conn.close()
    
    trigger_background_sheet_sync()
    return jsonify({"success": True})

# POST /api/members/sync
@app.route('/api/members/sync', methods=['POST'])
def manual_members_sync():
    link = sync_members_to_google_sheet()
    if link:
        return jsonify({"success": True, "link": link})
    else:
        return jsonify({"error": "Failed to synchronize with Google Sheets. Verify Drive credentials."}), 500

# GET /api/moms
@app.route('/api/moms', methods=['GET'])
def get_moms():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM moms ORDER BY date DESC, created_at DESC")
    rows = c.fetchall()
    conn.close()
    
    import json
    moms_list = []
    for r in rows:
        moms_list.append({
            "id": r["id"],
            "title": r["title"],
            "type": r["type"],
            "number": r["number"],
            "date": r["date"],
            "time": r["time"],
            "venue": r["venue"],
            "chaired_by": r["chaired_by"],
            "recorded_by": r["recorded_by"],
            "link": r["link"],
            "attendance": json.loads(r["attendance"]) if r["attendance"] else {},
            "agenda": json.loads(r["agenda"]) if r["agenda"] else [],
            "discussions": json.loads(r["discussions"]) if r["discussions"] else [],
            "action_items": json.loads(r["action_items"]) if r["action_items"] else [],
            "status": r["status"],
            "created_at": r["created_at"],
            "pdf_url": r["pdf_url"] if "pdf_url" in r.keys() else None,
            "google_drive_pdf_id": r["google_drive_pdf_id"] if "google_drive_pdf_id" in r.keys() else None,
            "president_name": r["president_name"] if "president_name" in r.keys() else "Rtr. Rishabh Guptha",
            "secretary_name": r["secretary_name"] if "secretary_name" in r.keys() else "Rtr. Lathiesh Kumar",
            "money_involved": json.loads(r["money_involved"]) if ("money_involved" in r.keys() and r["money_involved"]) else {"has_money": False, "amount": 0, "description": "", "type": "Expense"}
        })
    return jsonify(moms_list)

# GET /api/moms/<mom_id>
@app.route('/api/moms/<mom_id>', methods=['GET'])
def get_mom(mom_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM moms WHERE id = ?", (mom_id,))
    r = c.fetchone()
    conn.close()
    
    if not r:
        return jsonify({"error": "Meeting minutes not found"}), 404
        
    import json
    return jsonify({
        "id": r["id"],
        "title": r["title"],
        "type": r["type"],
        "number": r["number"],
        "date": r["date"],
        "time": r["time"],
        "venue": r["venue"],
        "chaired_by": r["chaired_by"],
        "recorded_by": r["recorded_by"],
        "link": r["link"],
        "attendance": json.loads(r["attendance"]) if r["attendance"] else {},
        "agenda": json.loads(r["agenda"]) if r["agenda"] else [],
        "discussions": json.loads(r["discussions"]) if r["discussions"] else [],
        "action_items": json.loads(r["action_items"]) if r["action_items"] else [],
        "status": r["status"],
        "created_at": r["created_at"],
        "pdf_url": r["pdf_url"] if "pdf_url" in r.keys() else None,
        "google_drive_pdf_id": r["google_drive_pdf_id"] if "google_drive_pdf_id" in r.keys() else None,
        "president_name": r["president_name"] if "president_name" in r.keys() else "Rtr. Rishabh Guptha",
        "secretary_name": r["secretary_name"] if "secretary_name" in r.keys() else "Rtr. Lathiesh Kumar",
        "money_involved": json.loads(r["money_involved"]) if ("money_involved" in r.keys() and r["money_involved"]) else {"has_money": False, "amount": 0, "description": "", "type": "Expense"}
    })

# POST /api/moms
@app.route('/api/moms', methods=['POST'])
def create_mom():
    data = request.json or {}
    import json
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Auto-generate auto-incrementing MOM ID
    c.execute("SELECT id FROM moms")
    ids = c.fetchall()
    max_num = 0
    for row in ids:
        val = row[0]
        if val.startswith('MOM-'):
            try:
                num = int(val.split('-')[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    next_id = f"MOM-{max_num + 1}"
    
    title = data.get('title', '')
    m_type = data.get('type', '')
    number = data.get('number', '')
    date = data.get('date', '')
    time_str = data.get('time', '')
    venue = data.get('venue', '')
    chaired_by = data.get('chaired_by', '')
    recorded_by = data.get('recorded_by', '')
    link = data.get('link', '')
    attendance = json.dumps(data.get('attendance', {}))
    agenda = json.dumps(data.get('agenda', []))
    discussions = json.dumps(data.get('discussions', []))
    action_items = json.dumps(data.get('action_items', []))
    status = data.get('status', 'Draft')
    created_at = datetime.datetime.now().isoformat()
    
    president_name = data.get('president_name', 'Rtr. Rishabh Guptha')
    secretary_name = data.get('secretary_name', 'Rtr. Lathiesh Kumar')
    
    money_involved_data = data.get('money_involved', {"has_money": False, "amount": 0, "description": "", "type": "Expense"})
    if isinstance(money_involved_data, dict):
        pictures = money_involved_data.get("pictures", [])
        if pictures:
            new_pictures = []
            for idx, pic in enumerate(pictures):
                if pic and isinstance(pic, str) and pic.startswith("data:image/"):
                    try:
                        res = handle_base64_upload(pic, f"MoM-{number or 'Document'}", "Pictures")
                        if res:
                            new_pictures.append(res['public_url'])
                        else:
                            new_pictures.append(pic)
                    except Exception as ex:
                        print(f"Error uploading MoM picture: {ex}")
                        new_pictures.append(pic)
                else:
                    new_pictures.append(pic)
            money_involved_data["pictures"] = new_pictures
    money_involved = json.dumps(money_involved_data)
    
    # Upload PDF if base64 provided
    pdf_base64 = data.get('pdf_base64', '')
    pdf_url = None
    google_drive_pdf_id = None
    if pdf_base64:
        upload_res = upload_mom_pdf(number, pdf_base64)
        if upload_res:
            pdf_url = upload_res["public_url"]
            google_drive_pdf_id = upload_res["drive_file_id"]
            
    c.execute("""
        INSERT INTO moms (id, title, type, number, date, time, venue, chaired_by, recorded_by, link, attendance, agenda, discussions, action_items, status, created_at, pdf_url, google_drive_pdf_id, president_name, secretary_name, money_involved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (next_id, title, m_type, number, date, time_str, venue, chaired_by, recorded_by, link, attendance, agenda, discussions, action_items, status, created_at, pdf_url, google_drive_pdf_id, president_name, secretary_name, money_involved))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "id": next_id, "pdf_url": pdf_url})

# PUT /api/moms/<mom_id>
@app.route('/api/moms/<mom_id>', methods=['PUT'])
def update_mom(mom_id):
    data = request.json or {}
    import json
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT google_drive_pdf_id, pdf_url FROM moms WHERE id = ?", (mom_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Meeting minutes not found"}), 404
        
    existing_drive_id = row[0]
    existing_pdf_url = row[1]
    
    title = data.get('title', '')
    m_type = data.get('type', '')
    number = data.get('number', '')
    date = data.get('date', '')
    time_str = data.get('time', '')
    venue = data.get('venue', '')
    chaired_by = data.get('chaired_by', '')
    recorded_by = data.get('recorded_by', '')
    link = data.get('link', '')
    attendance = json.dumps(data.get('attendance', {}))
    agenda = json.dumps(data.get('agenda', []))
    discussions = json.dumps(data.get('discussions', []))
    action_items = json.dumps(data.get('action_items', []))
    status = data.get('status', 'Draft')
    
    president_name = data.get('president_name', 'Rtr. Rishabh Guptha')
    secretary_name = data.get('secretary_name', 'Rtr. Lathiesh Kumar')
    
    money_involved_data = data.get('money_involved', {"has_money": False, "amount": 0, "description": "", "type": "Expense"})
    if isinstance(money_involved_data, dict):
        pictures = money_involved_data.get("pictures", [])
        if pictures:
            new_pictures = []
            for idx, pic in enumerate(pictures):
                if pic and isinstance(pic, str) and pic.startswith("data:image/"):
                    try:
                        res = handle_base64_upload(pic, f"MoM-{number or 'Document'}", "Pictures")
                        if res:
                            new_pictures.append(res['public_url'])
                        else:
                            new_pictures.append(pic)
                    except Exception as ex:
                        print(f"Error uploading MoM picture: {ex}")
                        new_pictures.append(pic)
                else:
                    new_pictures.append(pic)
            money_involved_data["pictures"] = new_pictures
    money_involved = json.dumps(money_involved_data)
    
    # Upload PDF if base64 provided
    pdf_base64 = data.get('pdf_base64', '')
    pdf_url = existing_pdf_url
    google_drive_pdf_id = existing_drive_id
    if pdf_base64:
        upload_res = upload_mom_pdf(number, pdf_base64)
        if upload_res:
            pdf_url = upload_res["public_url"]
            google_drive_pdf_id = upload_res["drive_file_id"]
            
    c.execute("""
        UPDATE moms
        SET title = ?, type = ?, number = ?, date = ?, time = ?, venue = ?, chaired_by = ?, recorded_by = ?, link = ?, attendance = ?, agenda = ?, discussions = ?, action_items = ?, status = ?, pdf_url = ?, google_drive_pdf_id = ?, president_name = ?, secretary_name = ?, money_involved = ?
        WHERE id = ?
    """, (title, m_type, number, date, time_str, venue, chaired_by, recorded_by, link, attendance, agenda, discussions, action_items, status, pdf_url, google_drive_pdf_id, president_name, secretary_name, money_involved, mom_id))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "pdf_url": pdf_url})

# PUT /api/moms/<mom_id>/action-items
@app.route('/api/moms/<mom_id>/action-items', methods=['PUT'])
def update_mom_action_items(mom_id):
    data = request.json or {}
    action_item_id = data.get('action_item_id', '')
    new_status = data.get('status', 'Pending')
    
    import json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT action_items FROM moms WHERE id = ?", (mom_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Meeting minutes not found"}), 404
        
    items = json.loads(row[0]) if row[0] else []
    updated = False
    for item in items:
        if str(item.get('id', '')) == str(action_item_id):
            item['status'] = new_status
            updated = True
            break
            
    if updated:
        c.execute("UPDATE moms SET action_items = ? WHERE id = ?", (json.dumps(items), mom_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    else:
        conn.close()
        return jsonify({"error": "Action item not found"}), 404

# DELETE /api/moms/<mom_id>
@app.route('/api/moms/<mom_id>', methods=['DELETE'])
def delete_mom(mom_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT google_drive_pdf_id FROM moms WHERE id = ?", (mom_id,))
    row = c.fetchone()
    drive_file_id = row[0] if row else None
    
    c.execute("DELETE FROM moms WHERE id = ?", (mom_id,))
    conn.commit()
    conn.close()
    
    # Remove from Google Drive if it exists
    if drive_file_id and has_google_drive:
        try:
            service = get_drive_service()
            if service:
                service.files().delete(fileId=drive_file_id).execute()
        except Exception as e:
            print(f"Error deleting file {drive_file_id} from Drive: {e}")
            
    return jsonify({"success": True})

# Default route: Serve static files of the website
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    # If path is empty, serve index.html
    if not path or path == "":
        path = "index.html"
    # Prevent path traversal
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Safe join
    safe_path = safe_join(base_dir, path)
    if safe_path and os.path.exists(safe_path) and os.path.isfile(safe_path):
        return send_from_directory(base_dir, path)
    # If file doesn't exist, fallback to index.html for Single Page Apps or show 404
    return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    print(f"Starting Rotaract Bangalore Warriors Dev Server on http://localhost:5000")
    print(f"Local storage folder: {UPLOADS_DIR}")
    app.run(host='0.0.0.0', port=5000, debug=True)
