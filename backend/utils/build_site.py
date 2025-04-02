import os
import json
import uuid
import base64
import shutil
from .encrypt import encrypt_images
from utils.path_config import TEMPLATE_SITE_DIR, SECRETS_DIR

PATCHED_INDEX_PATH = os.path.join(os.path.dirname(__file__), "../template_site/index.html")

def build_puzzle_site(
    image_paths,
    labels,
    indices,
    target_url,
    delivery_mode,
    output_dir,
    title="Secret Puzzle",
    fail_message="Wrong again? Try harder!"
):
    if not os.path.exists(TEMPLATE_SITE_DIR):
        raise Exception("Missing template_site/ folder.")

    if not (5 <= len(image_paths) <= 50):
        raise ValueError("Number of images must be between 5 and 50.")

    site_id = str(uuid.uuid4())[:8]
    site_path = os.path.join(output_dir, f"puzzle_{site_id}")
    os.makedirs(output_dir, exist_ok=True)
    shutil.copytree(TEMPLATE_SITE_DIR, site_path)

    # 🔧 Replace index.html if patched version exists
    if os.path.exists(PATCHED_INDEX_PATH):
        shutil.copy(PATCHED_INDEX_PATH, os.path.join(site_path, "index.html"))
        print("🔧 Replaced index.html with patched version (relative fetch paths)")
    else:
        print("⚠️ Patched index.html not found. Using default index.html")

    # Mapping: label -> image path
    label_map = {labels[i]: image_paths[i] for i in range(len(image_paths))}
    index_map = {labels[i]: indices[i] for i in range(len(image_paths))}
    obfuscation_map = {label: uuid.uuid4().hex[:12] for label in label_map}

    # Generate AES key
    key = os.urandom(32)
    key_b64 = base64.b64encode(key).decode()

    # 🔐 Encrypt images
    encrypted_dir = os.path.join(site_path, "encrypted")
    encrypt_images(
        image_paths=image_paths,
        key=key,
        output_dir=encrypted_dir,
        label_to_obfuscated={obfuscation_map[label]: label_map[label] for label in label_map}
    )

    # 📁 Save secrets to site/secrets/
    secrets_dir = os.path.join(site_path, "secrets")
    os.makedirs(secrets_dir, exist_ok=True)

    secrets = {
        "key.txt": key_b64,
        "index-map.json": json.dumps(index_map, indent=2),
        "obfuscation-map.json": json.dumps(obfuscation_map, indent=2),
        "target.txt": target_url.strip(),
        "delivery-mode.txt": delivery_mode.strip(),
        "title.txt": title.strip(),
        "fail-message.txt": fail_message.strip()
    }

    for filename, content in secrets.items():
        with open(os.path.join(secrets_dir, filename), "w") as f:
            f.write(content)

    # 📨 Copy to central backend/secrets for backend serving (optional)
    os.makedirs(SECRETS_DIR, exist_ok=True)
    for filename in secrets.keys():
        shutil.copy(
            os.path.join(secrets_dir, filename),
            os.path.join(SECRETS_DIR, filename)
        )
        print(f"🔐 Copied {filename} to {SECRETS_DIR}")

    # 🎁 Package as ZIP
    zip_path = os.path.join(output_dir, f"{site_id}.zip")
    shutil.make_archive(zip_path[:-4], 'zip', site_path)
    print(f"📦 Puzzle site generated at {site_path}")

    return zip_path, site_path
