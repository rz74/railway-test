import os
import json
import uuid
import base64
import shutil
from .encrypt import encrypt_images

TEMPLATE_SITE_PATH = os.path.join(os.path.dirname(__file__), "..", "template_site")

def build_puzzle_site(image_paths, labels, indices, target_url, delivery_mode, output_dir):
    if not os.path.exists(TEMPLATE_SITE_PATH):
        raise Exception("Missing template_site/ folder.")

    site_id = str(uuid.uuid4())[:8]
    site_path = os.path.join(output_dir, f"puzzle_{site_id}")
    os.makedirs(output_dir, exist_ok=True)
    shutil.copytree(TEMPLATE_SITE_PATH, site_path)

    # Map filenames
    label_map = {labels[i]: image_paths[i] for i in range(10)}
    index_map = {labels[i]: indices[i] for i in range(10)}
    obfuscation_map = {label: uuid.uuid4().hex[:12] for label in label_map}

    # Encryption key
    key = os.urandom(32)
    key_b64 = base64.b64encode(key).decode()

    # Encrypt images to /encrypted
    encrypted_dir = os.path.join(site_path, "encrypted")
    encrypt_images(key=key, output_dir=encrypted_dir, label_to_obfuscated={
        obfuscation_map[label]: label_map[label] for label in label_map
    })

    # Save secrets to site directory
    secrets_dir = os.path.join(site_path, "secrets")
    os.makedirs(secrets_dir, exist_ok=True)

    with open(os.path.join(secrets_dir, "key.txt"), "w") as f:
        f.write(key_b64)
    with open(os.path.join(secrets_dir, "index-map.json"), "w") as f:
        json.dump(index_map, f, indent=2)
    with open(os.path.join(secrets_dir, "obfuscation-map.json"), "w") as f:
        json.dump(obfuscation_map, f, indent=2)
    with open(os.path.join(secrets_dir, "target.txt"), "w") as f:
        f.write(target_url.strip())
    with open(os.path.join(secrets_dir, "delivery-mode.txt"), "w") as f:
        f.write(delivery_mode.strip())

    # Also copy secrets to backend/secrets (for serving via static endpoints)
    final_secrets_dir = os.path.join("backend", "secrets")
    os.makedirs(final_secrets_dir, exist_ok=True)
    for file in ["key.txt", "index-map.json", "obfuscation-map.json", "target.txt", "delivery-mode.txt"]:
        shutil.copy(os.path.join(secrets_dir, file), os.path.join(final_secrets_dir, file))
        print(f"🔐 Copied {file} to backend/secrets")

    # Zip up the site
    zip_path = os.path.join(output_dir, f"{site_id}.zip")
    shutil.make_archive(zip_path[:-4], 'zip', site_path)
    print(f"📦 Puzzle site generated at {site_path}")

    return zip_path, site_path
