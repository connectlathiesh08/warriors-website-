<%@ WebHandler Language="C#" Class="ProjectsApi" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Linq;

public class ProjectsApi : IHttpHandler {
    
    private static readonly object FileLock = new object();
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.End();
            return;
        }

        try {
            string method = context.Request.HttpMethod;
            string pathInfo = context.Request.PathInfo; // e.g. /PRJ-101
            string idParam = "";
            if (!string.IsNullOrEmpty(pathInfo)) {
                idParam = pathInfo.TrimStart('/');
            }

            if (method == "GET") {
                if (!string.IsNullOrEmpty(idParam)) {
                    GetProjectByIdOrSlug(context, idParam);
                } else {
                    GetProjects(context);
                }
            } else if (method == "POST") {
                if (idParam.EndsWith("/restore")) {
                    string restoreId = idParam.Substring(0, idParam.IndexOf("/restore"));
                    RestoreProject(context, restoreId);
                } else if (!string.IsNullOrEmpty(idParam)) {
                    // POST spoofed as PUT
                    UpdateProject(context, idParam);
                } else {
                    CreateProject(context);
                }
            } else if (method == "PUT") {
                UpdateProject(context, idParam);
            } else if (method == "DELETE") {
                DeleteProject(context, idParam);
            } else {
                context.Response.StatusCode = 405;
                context.Response.Write("{\"error\": \"Method not allowed\"}");
            }
        } catch (Exception ex) {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"error\": \"" + HttpUtility.JavaScriptStringEncode(ex.Message) + "\"}");
        }
    }

    private string GetDbPath() {
        string dir = HttpContext.Current.Server.MapPath("~/App_Data");
        if (!Directory.Exists(dir)) {
            Directory.CreateDirectory(dir);
        }
        return Path.Combine(dir, "projects.json");
    }

    private List<Dictionary<string, object>> LoadProjects() {
        string dbPath = GetDbPath();
        lock (FileLock) {
            if (!File.Exists(dbPath)) {
                return new List<Dictionary<string, object>>();
            }
            string json = File.ReadAllText(dbPath);
            var serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = int.MaxValue;
            try {
                var list = serializer.Deserialize<List<object>>(json);
                var result = new List<Dictionary<string, object>>();
                foreach (var item in list) {
                    var dict = item as Dictionary<string, object>;
                    if (dict != null) {
                        result.Add(dict);
                    }
                }
                return result;
            } catch {
                return new List<Dictionary<string, object>>();
            }
        }
    }

    private void SaveProjects(List<Dictionary<string, object>> list) {
        string dbPath = GetDbPath();
        var serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;
        string json = serializer.Serialize(list);
        lock (FileLock) {
            File.WriteAllText(dbPath, json);
        }
    }

    private void GetProjects(HttpContext context) {
        var list = LoadProjects();
        string status = context.Request.QueryString["status"];
        string q = context.Request.QueryString["q"];
        string sort = context.Request.QueryString["sort"];
        bool showTrash = context.Request.QueryString["trash"] == "true";

        // Filter out soft deleted or show only trash
        var query = list.Where(p => {
            bool isDeleted = p.ContainsKey("is_deleted") && Convert.ToInt32(p["is_deleted"]) == 1;
            return showTrash ? isDeleted : !isDeleted;
        });

        // 30 days old trash automatic cleanup
        if (showTrash) {
            var activeTrash = new List<Dictionary<string, object>>();
            bool changed = false;
            foreach (var p in list) {
                bool isDel = p.ContainsKey("is_deleted") && Convert.ToInt32(p["is_deleted"]) == 1;
                if (isDel && p.ContainsKey("deleted_at")) {
                    DateTime delTime;
                    if (DateTime.TryParse(Convert.ToString(p["deleted_at"]), out delTime)) {
                        if ((DateTime.Now - delTime).TotalDays > 30) {
                            changed = true;
                            continue; // permanently delete
                        }
                    }
                }
                activeTrash.Add(p);
            }
            if (changed) {
                SaveProjects(activeTrash);
                list = activeTrash;
                query = list.Where(p => p.ContainsKey("is_deleted") && Convert.ToInt32(p["is_deleted"]) == 1);
            }
        }

        if (!string.IsNullOrEmpty(status)) {
            query = query.Where(p => p.ContainsKey("status") && Convert.ToString(p["status"]).Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(q)) {
            string lq = q.ToLower();
            query = query.Where(p => 
                (p.ContainsKey("title") && Convert.ToString(p["title"]).ToLower().Contains(lq)) ||
                (p.ContainsKey("project_lead") && Convert.ToString(p["project_lead"]).ToLower().Contains(lq)) ||
                (p.ContainsKey("avenue") && Convert.ToString(p["avenue"]).ToLower().Contains(lq)) ||
                (p.ContainsKey("date") && Convert.ToString(p["date"]).ToLower().Contains(lq)) ||
                (p.ContainsKey("status") && Convert.ToString(p["status"]).ToLower().Contains(lq))
            );
        }

        // Sort newest first by default
        var resultList = query.ToList();
        resultList.Sort((x, y) => {
            string dx = x.ContainsKey("date") ? Convert.ToString(x["date"]) : "";
            string dy = y.ContainsKey("date") ? Convert.ToString(y["date"]) : "";
            int cmp = string.Compare(dy, dx); // desc by default
            if (sort == "oldest") {
                cmp = string.Compare(dx, dy); // asc
            }
            return cmp;
        });

        // Add isPublished boolean dynamic property
        foreach (var p in resultList) {
            p["isPublished"] = p.ContainsKey("status") && Convert.ToString(p["status"]) == "Published";
        }

        var serializer = new JavaScriptSerializer();
        context.Response.Write(serializer.Serialize(resultList));
    }

    private void GetProjectByIdOrSlug(HttpContext context, string idOrSlug) {
        var list = LoadProjects();
        var p = list.FirstOrDefault(item => 
            (item.ContainsKey("id") && Convert.ToString(item["id"]) == idOrSlug) ||
            (item.ContainsKey("slug") && Convert.ToString(item["slug"]) == idOrSlug)
        );

        if (p == null || (p.ContainsKey("is_deleted") && Convert.ToInt32(p["is_deleted"]) == 1)) {
            context.Response.StatusCode = 404;
            context.Response.Write("{\"error\": \"Project not found\"}");
            return;
        }

        p["isPublished"] = p.ContainsKey("status") && Convert.ToString(p["status"]) == "Published";
        var serializer = new JavaScriptSerializer();
        context.Response.Write(serializer.Serialize(p));
    }

    private string HandleFileUpload(HttpPostedFile file, string projName, string subfolder) {
        if (file == null || file.ContentLength == 0) return null;
        
        string filename = Path.GetFileName(file.FileName);
        // Make safe filename
        string safeFilename = "";
        foreach (char c in filename) {
            if (char.IsLetterOrDigit(c) || c == '.' || c == '_' || c == '-' || c == ' ') {
                safeFilename += c;
            }
        }
        
        string uploadDir = HttpContext.Current.Server.MapPath("~/uploads");
        if (!Directory.Exists(uploadDir)) {
            Directory.CreateDirectory(uploadDir);
        }
        
        string timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
        string localFilename = timestamp + "_" + safeFilename;
        string fullPath = Path.Combine(uploadDir, localFilename);
        file.SaveAs(fullPath);
        
        return "/uploads/" + localFilename;
    }

    private string HandleBase64Upload(string base64Str, string projName, string subfolder) {
        if (string.IsNullOrEmpty(base64Str) || !base64Str.StartsWith("data:image/")) {
            return base64Str;
        }
        try {
            int commaIdx = base64Str.IndexOf(',');
            string header = base64Str.Substring(0, commaIdx);
            string encoded = base64Str.Substring(commaIdx + 1);
            
            string ext = "jpg";
            if (header.Contains("image/png")) ext = "png";
            else if (header.Contains("image/gif")) ext = "gif";
            else if (header.Contains("image/webp")) ext = "webp";
            
            byte[] data = Convert.FromBase64String(encoded);
            string uploadDir = HttpContext.Current.Server.MapPath("~/uploads");
            if (!Directory.Exists(uploadDir)) {
                Directory.CreateDirectory(uploadDir);
            }
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            string localFilename = "b64_" + timestamp + "." + ext;
            string fullPath = Path.Combine(uploadDir, localFilename);
            File.WriteAllBytes(fullPath, data);
            
            return "/uploads/" + localFilename;
        } catch {
            return base64Str;
        }
    }

    private void CreateProject(HttpContext context) {
        var list = LoadProjects();
        var request = context.Request;
        
        string projId = "PRJ-" + (101 + list.Count);
        string title = request.Form["title"] ?? "Untitled Project";
        string slug = request.Form["slug"];
        if (string.IsNullOrEmpty(slug)) {
            slug = GenerateSlug(title, projId);
        }

        // Ensure unique slug
        if (list.Any(p => p.ContainsKey("slug") && Convert.ToString(p["slug"]) == slug)) {
            slug = slug + "-" + DateTime.Now.Ticks.ToString().Substring(10);
        }

        string coverImageUrl = request.Form["cover_image"] ?? "assets/projects/proj-0.png";
        if (coverImageUrl != null && coverImageUrl.StartsWith("data:image/")) {
            coverImageUrl = HandleBase64Upload(coverImageUrl, title, "Cover Image");
        } else if (request.Files["cover_image_file"] != null) {
            string localUrl = HandleFileUpload(request.Files["cover_image_file"], title, "Cover Image");
            if (localUrl != null) coverImageUrl = localUrl;
        }

        var galleryList = new List<string>();
        for (int i = 0; i < request.Files.Count; i++) {
            string key = request.Files.GetKey(i);
            if (key == "gallery_files" || key.StartsWith("gallery_files[")) {
                string localUrl = HandleFileUpload(request.Files[i], title, "Gallery");
                if (localUrl != null) galleryList.Add(localUrl);
            }
        }

        var documentList = new List<string>();
        for (int i = 0; i < request.Files.Count; i++) {
            string key = request.Files.GetKey(i);
            if (key == "document_files" || key.StartsWith("document_files[")) {
                string localUrl = HandleFileUpload(request.Files[i], title, "Documents");
                if (localUrl != null) documentList.Add(localUrl);
            }
        }

        string status = request.Form["status"] ?? "Draft";
        string publishedDate = status == "Published" ? DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss") : null;

        var newP = new Dictionary<string, object>();
        newP["id"] = projId;
        newP["slug"] = slug;
        newP["title"] = title;
        newP["short_description"] = request.Form["short_description"] ?? "";
        newP["full_description"] = request.Form["full_description"] ?? "";
        newP["avenue"] = request.Form["avenue"] ?? "Community Service";
        newP["date"] = request.Form["date"] ?? DateTime.Now.ToString("yyyy-MM-dd");
        newP["time"] = request.Form["time"] ?? "";
        newP["venue"] = request.Form["venue"] ?? "";
        newP["google_map_location"] = request.Form["google_map_location"] ?? "";
        newP["chief_guest"] = request.Form["chief_guest"] ?? "";
        newP["project_lead"] = request.Form["project_lead"] ?? "";
        
        var serializer = new JavaScriptSerializer();
        newP["volunteers"] = string.IsNullOrEmpty(request.Form["volunteers"]) ? new List<string>() : request.Form["volunteers"].Split(',').ToList();
        newP["sponsors"] = string.IsNullOrEmpty(request.Form["sponsors"]) ? new List<string>() : request.Form["sponsors"].Split(',').ToList();
        newP["partners"] = string.IsNullOrEmpty(request.Form["partners"]) ? new List<string>() : request.Form["partners"].Split(',').ToList();
        
        int budget = 0; int.TryParse(request.Form["budget"], out budget); newP["budget"] = budget;
        int funds = 0; int.TryParse(request.Form["funds_raised"], out funds); newP["funds_raised"] = funds;
        int ben = 0; int.TryParse(request.Form["beneficiaries"], out ben); newP["beneficiaries"] = ben;
        int imp = 0; int.TryParse(request.Form["impact"], out imp); newP["impact"] = imp;

        newP["gallery"] = galleryList;
        newP["cover_image"] = coverImageUrl;
        newP["documents"] = documentList;
        newP["videos"] = string.IsNullOrEmpty(request.Form["videos"]) ? new List<string>() : request.Form["videos"].Split(',').ToList();
        
        newP["status"] = status;
        newP["created_by"] = request.Form["created_by"] ?? "Admin";
        newP["created_date"] = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        newP["last_updated"] = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        newP["published_date"] = publishedDate;
        newP["is_deleted"] = 0;
        newP["deleted_at"] = null;

        list.Add(newP);
        SaveProjects(list);

        context.Response.Write("{\"success\": true, \"id\": \"" + projId + "\", \"slug\": \"" + slug + "\"}");
    }

    private void UpdateProject(HttpContext context, string projId) {
        var list = LoadProjects();
        var p = list.FirstOrDefault(item => Convert.ToString(item["id"]) == projId);
        if (p == null) {
            context.Response.StatusCode = 404;
            context.Response.Write("{\"error\": \"Project not found\"}");
            return;
        }

        var request = context.Request;
        string title = request.Form["title"] ?? Convert.ToString(p["title"]);

        string coverImageUrl = request.Form["cover_image"] ?? (p.ContainsKey("cover_image") ? Convert.ToString(p["cover_image"]) : "assets/projects/proj-0.png");
        if (coverImageUrl != null && coverImageUrl.StartsWith("data:image/")) {
            coverImageUrl = HandleBase64Upload(coverImageUrl, title, "Cover Image");
        } else if (request.Files["cover_image_file"] != null) {
            string localUrl = HandleFileUpload(request.Files["cover_image_file"], title, "Cover Image");
            if (localUrl != null) coverImageUrl = localUrl;
        }

        // Gallery uploads append
        var galleryList = new List<string>();
        if (p.ContainsKey("gallery") && p["gallery"] is System.Collections.IEnumerable) {
            foreach (var item in (System.Collections.IEnumerable)p["gallery"]) {
                galleryList.Add(Convert.ToString(item));
            }
        }
        for (int i = 0; i < request.Files.Count; i++) {
            string key = request.Files.GetKey(i);
            if (key == "gallery_files" || key.StartsWith("gallery_files[")) {
                string localUrl = HandleFileUpload(request.Files[i], title, "Gallery");
                if (localUrl != null) galleryList.Add(localUrl);
            }
        }

        // Documents uploads append
        var documentList = new List<string>();
        if (p.ContainsKey("documents") && p["documents"] is System.Collections.IEnumerable) {
            foreach (var item in (System.Collections.IEnumerable)p["documents"]) {
                documentList.Add(Convert.ToString(item));
            }
        }
        for (int i = 0; i < request.Files.Count; i++) {
            string key = request.Files.GetKey(i);
            if (key == "document_files" || key.StartsWith("document_files[")) {
                string localUrl = HandleFileUpload(request.Files[i], title, "Documents");
                if (localUrl != null) documentList.Add(localUrl);
            }
        }

        string status = request.Form["status"] ?? Convert.ToString(p["status"]);
        string publishedDate = p.ContainsKey("published_date") ? Convert.ToString(p["published_date"]) : null;
        if (status == "Published" && string.IsNullOrEmpty(publishedDate)) {
            publishedDate = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        }

        p["title"] = title;
        p["short_description"] = request.Form["short_description"] ?? (p.ContainsKey("short_description") ? p["short_description"] : "");
        p["full_description"] = request.Form["full_description"] ?? (p.ContainsKey("full_description") ? p["full_description"] : "");
        p["avenue"] = request.Form["avenue"] ?? (p.ContainsKey("avenue") ? p["avenue"] : "Community Service");
        p["date"] = request.Form["date"] ?? (p.ContainsKey("date") ? p["date"] : DateTime.Now.ToString("yyyy-MM-dd"));
        p["time"] = request.Form["time"] ?? (p.ContainsKey("time") ? p["time"] : "");
        p["venue"] = request.Form["venue"] ?? (p.ContainsKey("venue") ? p["venue"] : "");
        p["google_map_location"] = request.Form["google_map_location"] ?? (p.ContainsKey("google_map_location") ? p["google_map_location"] : "");
        p["chief_guest"] = request.Form["chief_guest"] ?? (p.ContainsKey("chief_guest") ? p["chief_guest"] : "");
        p["project_lead"] = request.Form["project_lead"] ?? (p.ContainsKey("project_lead") ? p["project_lead"] : "");
        
        p["volunteers"] = string.IsNullOrEmpty(request.Form["volunteers"]) ? (p.ContainsKey("volunteers") ? p["volunteers"] : new List<string>()) : request.Form["volunteers"].Split(',').ToList();
        p["sponsors"] = string.IsNullOrEmpty(request.Form["sponsors"]) ? (p.ContainsKey("sponsors") ? p["sponsors"] : new List<string>()) : request.Form["sponsors"].Split(',').ToList();
        p["partners"] = string.IsNullOrEmpty(request.Form["partners"]) ? (p.ContainsKey("partners") ? p["partners"] : new List<string>()) : request.Form["partners"].Split(',').ToList();
        
        if (request.Form["budget"] != null) { int val; int.TryParse(request.Form["budget"], out val); p["budget"] = val; }
        if (request.Form["funds_raised"] != null) { int val; int.TryParse(request.Form["funds_raised"], out val); p["funds_raised"] = val; }
        if (request.Form["beneficiaries"] != null) { int val; int.TryParse(request.Form["beneficiaries"], out val); p["beneficiaries"] = val; }
        if (request.Form["impact"] != null) { int val; int.TryParse(request.Form["impact"], out val); p["impact"] = val; }

        p["gallery"] = galleryList;
        p["cover_image"] = coverImageUrl;
        p["documents"] = documentList;
        if (request.Form["videos"] != null) {
            p["videos"] = string.IsNullOrEmpty(request.Form["videos"]) ? new List<string>() : request.Form["videos"].Split(',').ToList();
        }
        
        p["status"] = status;
        p["last_updated"] = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        p["published_date"] = publishedDate;

        SaveProjects(list);
        context.Response.Write("{\"success\": true}");
    }

    private void DeleteProject(HttpContext context, string projId) {
        var list = LoadProjects();
        var p = list.FirstOrDefault(item => Convert.ToString(item["id"]) == projId);
        if (p == null) {
            context.Response.StatusCode = 404;
            context.Response.Write("{\"error\": \"Project not found\"}");
            return;
        }

        bool isDeleted = p.ContainsKey("is_deleted") && Convert.ToInt32(p["is_deleted"]) == 1;
        if (isDeleted) {
            // Permanent delete
            list.Remove(p);
        } else {
            // Soft delete
            p["is_deleted"] = 1;
            p["deleted_at"] = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
        }

        SaveProjects(list);
        context.Response.Write("{\"success\": true}");
    }

    private void RestoreProject(HttpContext context, string projId) {
        var list = LoadProjects();
        var p = list.FirstOrDefault(item => Convert.ToString(item["id"]) == projId);
        if (p == null) {
            context.Response.StatusCode = 404;
            context.Response.Write("{\"error\": \"Project not found\"}");
            return;
        }

        p["is_deleted"] = 0;
        p["deleted_at"] = null;

        SaveProjects(list);
        context.Response.Write("{\"success\": true}");
    }

    private string GenerateSlug(string title, string idVal) {
        if (string.IsNullOrEmpty(title)) return "project-" + idVal;
        string slug = title.ToLower().Trim();
        // Remove special chars
        string clean = "";
        foreach (char c in slug) {
            if (char.IsLetterOrDigit(c) || c == ' ' || c == '-') {
                clean += c;
            }
        }
        return clean.Replace(' ', '-').Replace("--", "-");
    }

    public bool IsReusable {
        get { return true; }
    }
}
