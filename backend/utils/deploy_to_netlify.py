
import os
import zipfile
import requests
import uuid
import certifi

def deploy_to_netlify(site_dir, netlify_token):
    zip_filename = f"{uuid.uuid4().hex[:8]}_site.zip"
    zip_path = os.path.join("/tmp" if os.name != 'nt' else ".", zip_filename)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(site_dir):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, start=site_dir)
                zipf.write(filepath, arcname)

    headers = {
        "Authorization": f"Bearer {netlify_token}"
    }

    files = {
        'file': open(zip_path, 'rb')
    }

    response = requests.post(
        "https://api.netlify.com/api/v1/sites",
        headers=headers,
        files=files,
        verify=certifi.where()  # <- This fixes the SSL cert issue
    )

    files['file'].close()
    os.remove(zip_path)

    if response.status_code == 200:
        site_info = response.json()
        return {"success": True, "url": site_info["url"], "admin_url": site_info["admin_url"]}
    else:
        return {"success": False, "error": response.text, "status": response.status_code}
