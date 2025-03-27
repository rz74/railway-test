import os
import zipfile
import requests
import uuid
import certifi

def deploy_to_netlify(site_dir, netlify_token):
    # Create ZIP archive of the site contents
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

    # Step 1: Create the site
    site_response = requests.post(
        "https://api.netlify.com/api/v1/sites",
        headers=headers,
        verify=certifi.where()
    )

    if site_response.status_code != 200:
        return {"success": False, "error": site_response.text}

    site_info = site_response.json()
    site_id = site_info["id"]

    # Step 2: Deploy the zip to the created site
    deploy_url = f"https://api.netlify.com/api/v1/sites/{site_id}/deploys"
    with open(zip_path, 'rb') as f:
        deploy_response = requests.post(
            deploy_url,
            headers=headers,
            files={"file": f},
            verify=certifi.where()
        )

    os.remove(zip_path)

    if deploy_response.status_code == 200:
        return {
            "success": True,
            "url": site_info["url"],
            "admin_url": site_info["admin_url"]
        }
    else:
        return {
            "success": False,
            "error": deploy_response.text,
            "status": deploy_response.status_code
        }
