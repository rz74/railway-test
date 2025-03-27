import os
import zipfile
import requests
import uuid
import certifi

def deploy_to_netlify(site_path, netlify_token):
    # Step 1: Zip the folder
    zip_filename = f"{uuid.uuid4().hex[:8]}_site.zip"
    zip_path = os.path.join("/tmp" if os.name != 'nt' else ".", zip_filename)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(site_path):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, start=site_path)
                zipf.write(filepath, arcname)

    # Step 2: Use correct API for new deploy
    headers = {
        "Authorization": f"Bearer {netlify_token}"
    }

    # Create a new site first
    create_res = requests.post(
        "https://api.netlify.com/api/v1/sites",
        headers=headers,
        verify=certifi.where()
    )
    if create_res.status_code != 200:
        return {"success": False, "error": f"Site creation failed: {create_res.text}"}

    site_info = create_res.json()
    site_id = site_info["id"]

    # Step 3: Deploy the site files using /deploys
    deploy_url = f"https://api.netlify.com/api/v1/sites/{site_id}/deploys"
    with open(zip_path, 'rb') as f:
        deploy_res = requests.post(
            deploy_url,
            headers=headers,
            files={'file': f},
            verify=certifi.where()
        )

    os.remove(zip_path)

    if deploy_res.status_code != 200:
        return {"success": False, "error": f"Deploy failed: {deploy_res.text}"}

    deploy_info = deploy_res.json()
    return {"success": True, "url": deploy_info["deploy_ssl_url"], "admin_url": site_info["admin_url"]}
