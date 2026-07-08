# Rotaract Club of Bangalore Warriors - Web Portal & Admin Dashboard

Welcome to the official repository for the **Rotaract Club of Bangalore Warriors** website. This portal features a beautifully replicated homepage, custom navigation layouts, interactive signatories, a dynamic A4 Minutes of Meeting (MoM) PDF generator, event calendar integration, and full Google Drive/Sheets synchronization.

---

## 🚀 Deployment on Vercel

This repository is optimized for out-of-the-box deployment to Vercel as a hybrid application (static HTML/CSS/JS frontend + Python Flask serverless backend).

### 1. Zero-Config Fallback Mode (Staging / Devs)
If deployed to Vercel without configuring credentials, the portal operates in **local fallback mode**:
* SQLite database runs out of `/tmp/projects.db`.
* Uploaded files/images write to `/tmp/uploads/`.
* Saving minutes of meeting, calendar events, finances, members, and uploading projects will succeed without errors.
* *Note: Data will be reset on Vercel cold starts in fallback mode.*

### 2. Full Cloud Persistence Mode (Google Drive & Sheets Integration)
To enable permanent cloud storage and prevent Vercel data loss, configure the following **Environment Variables** in your Vercel project dashboard:

| Variable Name | Description |
|---|---|
| `GOOGLE_TOKEN_JSON` | The entire JSON string content of your `google-token.json` |
| `GOOGLE_CREDENTIALS_JSON` | The entire JSON string content of your `google-credentials.json` (Service Account) |
| `GOOGLE_OAUTH_SECRETS_JSON` | The entire JSON string content of your `google-oauth-credentials.json` |

Once configured, the portal will:
* Automatically download/restore the database (`projects.db`) from Google Drive on startup.
* Back up the database to Google Drive on every write operation.
* Upload project reports, gallery photos, and cover images to Google Drive.
* Synchronize members and finances to Google Sheets.
* Sync events to Google Calendar.

---

## 💻 Local Development

### Prerequisites
* Python 3.8+
* Google Drive credential JSON files in the project root:
  - `google-token.json`
  - `google-credentials.json`
  - `google-oauth-credentials.json`

### Setup and Running
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the local Flask backend server:
   ```bash
   python server.py
   ```
3. Open `index.html` or `admin.html` in your browser (e.g. using VS Code Live Server on port `8000` or opening files directly). 
4. The dashboard is configured to automatically communicate with the Flask server on port `5000` (including local IP subnets for mobile browser testing).
