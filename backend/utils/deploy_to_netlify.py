# import requests

# def upload_zip_to_netlify(zip_path, netlify_token):
#     with open(zip_path, "rb") as f:
#         zip_bytes = f.read()

#     headers = {
#         "Authorization": f"Bearer {netlify_token}",
#     }

#     files = {
#         "file": ("site.zip", zip_bytes, "application/zip"),
#     }

#     response = requests.post("https://api.netlify.com/api/v1/sites", headers=headers, files=files)

#     if response.status_code in (200, 201):
#         return response.json().get("ssl_url")
#     else:
#         raise Exception(f"Failed to deploy to Netlify: {response.status_code} - {response.text}")
    

import requests

def upload_zip_to_netlify(zip_path, netlify_token):
    headers = {
        "Authorization": f"Bearer {netlify_token}",
    }

    # Step 1: Create new site
    site_resp = requests.post("https://api.netlify.com/api/v1/sites", headers=headers)
    if site_resp.status_code not in (200, 201):
        raise Exception(f"Failed to create Netlify site: {site_resp.status_code} - {site_resp.text}")
    
    site_info = site_resp.json()
    site_id = site_info["id"]

    # Step 2: Deploy ZIP to new site
    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    files = {
        "file": ("site.zip", zip_bytes, "application/zip"),
    }

    deploy_url = f"https://api.netlify.com/api/v1/sites/{site_id}/deploys"
    deploy_resp = requests.post(deploy_url, headers=headers, files=files)

    if deploy_resp.status_code in (200, 201):
        return site_info.get("ssl_url") or site_info.get("url")
    else:
        raise Exception(f"Failed to deploy ZIP: {deploy_resp.status_code} - {deploy_resp.text}")

