import requests
import time

def upload_zip_to_netlify(zip_path, netlify_token):
    headers = {
        "Authorization": f"Bearer {netlify_token}",
    }

    # Step 1: Create new site
    site_resp = requests.post("https://api.netlify.com/api/v1/sites", headers=headers)
    if site_resp.status_code not in (200, 201):
        raise Exception(f"❌ Failed to create Netlify site: {site_resp.status_code} - {site_resp.text}")
    
    site_info = site_resp.json()
    site_id = site_info["id"]
    site_url = site_info.get("ssl_url") or site_info.get("url")

    print(f"✅ Site created: {site_url}")

    # Step 2: Prepare ZIP bytes
    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    files = {
        "file": ("site.zip", zip_bytes, "application/zip"),
    }

    deploy_url = f"https://api.netlify.com/api/v1/sites/{site_id}/deploys"

    # Step 3: First deploy
    print("📦 Deploying site (1st pass)...")
    deploy_resp = requests.post(deploy_url, headers=headers, files=files)
    if deploy_resp.status_code not in (200, 201):
        raise Exception(f"❌ Failed first deploy: {deploy_resp.status_code} - {deploy_resp.text}")
    print("✅ First deploy succeeded")

    # Step 4: Optional wait
    time.sleep(2)

    # Step 5: Re-deploy ZIP just to be sure
    print("📦 Deploying site (2nd pass)...")
    redeploy_resp = requests.post(deploy_url, headers=headers, files=files)
    if redeploy_resp.status_code not in (200, 201):
        raise Exception(f"❌ Failed second deploy: {redeploy_resp.status_code} - {redeploy_resp.text}")
    print("✅ Second deploy succeeded")

    return site_url
