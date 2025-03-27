
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
    site_path = os.path.join(output_dir, f"puzzle_{{site_id}}")
    shutil.copytree(TEMPLATE_SITE_PATH, site_path)

    # Copy netlify.toml
    source_toml = os.path.join(TEMPLATE_SITE_PATH, "netlify.toml")
    dest_toml = os.path.join(site_path, "netlify.toml")
    shutil.copy2(source_toml, dest_toml)

    # Copy functions folder from .netlify/functions
    source_functions = os.path.join(TEMPLATE_SITE_PATH, ".netlify", "functions")
    dest_functions = os.path.join(site_path, "netlify", "functions")
    if os.path.exists(source_functions):
        shutil.copytree(source_functions, dest_functions)
    else:
        print("⚠️ Warning: No Netlify functions folder found.")

    label_map = {}
    index_map = {}
    for i in range(10):
        label_map[labels[i]] = image_paths[i]
        index_map[labels[i]] = indices[i]

    obfuscation_map = {{
        label: uuid.uuid4().hex[:12] for label in label_map
    }}

    key = os.urandom(32)
    key_b64 = base64.b64encode(key).decode()

    encrypted_dir = os.path.join(site_path, "encrypted")
    encrypt_images(image_paths, key, encrypted_dir, {{
        obfuscation_map[label]: label_map[label] for label in label_map
    }})

    secrets_dir = os.path.join(site_path, "secrets")
    os.makedirs(secrets_dir, exist_ok=True)
    with open(os.path.join(secrets_dir, "key.txt"), "w") as f:
        f.write(key_b64)
    with open(os.path.join(secrets_dir, "index-map.json"), "w") as f:
        json.dump(index_map, f)
    with open(os.path.join(secrets_dir, "obfuscation-map.json"), "w") as f:
        json.dump(obfuscation_map, f)
    with open(os.path.join(secrets_dir, "target.txt"), "w") as f:
        f.write(target_url.strip())
    with open(os.path.join(secrets_dir, "delivery-mode.txt"), "w") as f:
        f.write(delivery_mode)

    zip_path = os.path.join(output_dir, f"{{site_id}}.zip")
    shutil.make_archive(zip_path[:-4], 'zip', site_path)

    return zip_path, site_path
