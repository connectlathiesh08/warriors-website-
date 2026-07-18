from test_drive import service, parent_id, folders

folder_ids = [parent_id] + [f['id'] for f in folders]
parent_queries = " or ".join([f"'{fid}' in parents" for fid in folder_ids])
q = f"({parent_queries}) and mimeType contains 'image/' and trashed = false"

results = service.files().list(q=q, fields="files(name, id)").execute().get('files', [])
print(f"Total files: {len(results)}")
for r in results[:30]:
    print(f"Name: {r['name']} | ID: {r['id']}")
