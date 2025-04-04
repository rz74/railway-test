import requests
import time
import uuid

def upload_zip_to_netlify(zip_path, netlify_token):
    headers = {
        "Authorization": f"Bearer {netlify_token}",
    }

    # Step 1: Create site with unique name
    site_name = f"puzzle-site-{uuid.uuid4().hex[:8]}"
    create_payload = {
        "name": site_name
    }

    print(f"🚀 Creating site: {site_name}")
    site_resp = requests.post("https://api.netlify.com/api/v1/sites", headers=headers, json=create_payload)
    if site_resp.status_code not in (200, 201):
        raise Exception(f"❌ Failed to create Netlify site: {site_resp.status_code} - {site_resp.text}")

    site_info = site_resp.json()
    site_url = site_info.get("ssl_url") or site_info.get("url")

    print(f"✅ Site created: {site_url}")

    # Step 2: Wait for provisioning
    print("⏳ Waiting for site to finish provisioning...")
    for _ in range(10):
        status_resp = requests.get(f"https://api.netlify.com/api/v1/sites/{site_name}", headers=headers)
        if status_resp.status_code == 200:
            state = status_resp.json().get("state")
            if state == "current":
                print("✅ Site is ready for deploy.")
                break
        time.sleep(1)
    else:
        raise Exception("❌ Timed out waiting for site provisioning.")

    # Step 3: Upload ZIP
    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    files = {
        "file": ("site.zip", zip_bytes, "application/zip"),
    }

    print("📦 Deploying ZIP...")
    deploy_resp = requests.post(f"https://api.netlify.com/api/v1/sites/{site_name}/deploys", headers=headers, files=files)
    if deploy_resp.status_code not in (200, 201):
        raise Exception(f"❌ Failed to deploy ZIP: {deploy_resp.status_code} - {deploy_resp.text}")

    print("✅ Deployment successful!")

    return site_url
