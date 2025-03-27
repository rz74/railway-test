import os
import zipfile
import requests
import uuid
import certifi

def deploy_to_netlify(site_path, netlify_token):
    # Step 1: Zip the directory
    zip_filename = f"{uuid.uuid4().hex[:8]}_site.zip"
    zip_path = os.path.join("/tmp" if os.name != 'nt' else ".", zip_filename)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(site_path):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, start=site_path)
                zipf.write(filepath, arcname)

    headers = {
        "Authorization": f"Bearer {netlify_token}",
    }

    # Step 2: Create the site
    site_res = requests.post(
        "https://api.netlify.com/api/v1/sites",
        headers=headers,
        verify=certifi.where()
    )

    if site_res.status_code != 200:
        return {
            "success": False,
            "error": "Site creation failed",
            "details": site_res.json()
        }

    site_info = site_res.json()
    site_id = site_info["id"]

    # Step 3: Upload deploy ZIP
    files = {'file': open(zip_path, 'rb')}
    deploy_res = requests.post(
        f"https://api.netlify.com/api/v1/sites/{site_id}/deploys",
        headers=headers,
        files=files,
        verify=certifi.where()
    )

    files['file'].close()
    os.remove(zip_path)

    if deploy_res.status_code != 200:
        return {
            "success": False,
            "error": "Deploy failed",
            "details": deploy_res.json()
        }

    deploy_info = deploy_res.json()
    return {
        "success": True,
        "url": deploy_info.get("deploy_ssl_url") or deploy_info.get("url"),
        "admin_url": site_info.get("admin_url")
    }
