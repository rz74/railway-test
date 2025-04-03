import requests

def upload_zip_to_netlify(zip_path, netlify_token):
    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    headers = {
        "Authorization": f"Bearer {netlify_token}",
    }

    files = {
        "file": ("site.zip", zip_bytes, "application/zip"),
    }

    response = requests.post("https://api.netlify.com/api/v1/sites", headers=headers, files=files)

    if response.status_code in (200, 201):
        return response.json().get("ssl_url")
    else:
        raise Exception(f"Failed to deploy to Netlify: {response.status_code} - {response.text}")
