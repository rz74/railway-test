import os
import json
import uuid
import base64
import shutil
from .encrypt import encrypt_images
from utils.path_config import TEMPLATE_SITE_DIR, SECRETS_DIR

PATCHED_INDEX_PATH = os.path.join(os.path.dirname(__file__), "../template_site/index.html")

def build_puzzle_site(image_paths, labels, indices, target_url, delivery_mode, output_dir):
    if not os.path.exists(TEMPLATE_SITE_DIR):
        raise Exception("Missing template_site/ folder.")

    site_id = str(uuid.uuid4())[:8]
    site_path = os.path.join(output_dir, f"puzzle_{site_id}")
    os.makedirs(output_dir, exist_ok=True)
    shutil.copytree(TEMPLATE_SITE_DIR, site_path)

    # 🧠 Replace index.html with patched relative version
    if os.path.exists(PATCHED_INDEX_PATH):
        shutil.copy(PATCHED_INDEX_PATH, os.path.join(site_path, "index.html"))
        print("🔧 Replaced index.html with patched version (relative fetch paths)")
    else:
        print("⚠️ Patched index.html not found. Using default index.html")

    # Map filenames
    label_map = {labels[i]: image_paths[i] for i in range(10)}
    index_map = {labels[i]: indices[i] for i in range(10)}
    obfuscation_map = {label: uuid.uuid4().hex[:12] for label in label_map}

    # Generate encryption key
    key = os.urandom(32)
    key_b64 = base64.b64encode(key).decode()

    # Encrypt and store in site folder
    encrypted_dir = os.path.join(site_path, "encrypted")
    encrypt_images(
        image_paths=image_paths,
        key=key,
        output_dir=encrypted_dir,
        label_to_obfuscated={obfuscation_map[label]: label_map[label] for label in label_map}
    )

    # Save secrets in site/secrets
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

    # Copy secrets to central serving directory
    os.makedirs(SECRETS_DIR, exist_ok=True)
    for file in ["key.txt", "index-map.json", "obfuscation-map.json", "target.txt", "delivery-mode.txt"]:
        shutil.copy(
            os.path.join(secrets_dir, file),
            os.path.join(SECRETS_DIR, file)
        )
        print(f"🔐 Copied {file} to {SECRETS_DIR}")

    # Create zip
    zip_path = os.path.join(output_dir, f"{site_id}.zip")
    shutil.make_archive(zip_path[:-4], 'zip', site_path)
    print(f"📦 Puzzle site generated at {site_path}")

    return zip_path, site_path
