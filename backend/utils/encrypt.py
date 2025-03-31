import os
import base64
from typing import List, Dict
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from PIL import Image


def convert_to_jpg(image_path: str) -> str:
    if image_path.lower().endswith((".jpg", ".jpeg")):
        return image_path
    img = Image.open(image_path)
    new_path = image_path.rsplit(".", 1)[0] + ".jpg"
    rgb = img.convert("RGB")
    rgb.save(new_path, "JPEG")
    return new_path


def encrypt_image(path: str, key: bytes) -> bytes:
    path = convert_to_jpg(path)
    with open(path, "rb") as f:
        plaintext = f.read()

    nonce = get_random_bytes(12)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)

    return nonce + tag + ciphertext


def encrypt_images(image_paths: List[str], key: bytes, output_dir: str, label_to_obfuscated: Dict[str, str]):
    os.makedirs(output_dir, exist_ok=True)
    for label, original_path in label_to_obfuscated.items():
        try:
            enc_data = encrypt_image(original_path, key)
            out_path = os.path.join(output_dir, f"{label}.enc")
            with open(out_path, "wb") as f:
                f.write(enc_data)
        except Exception as e:
            print(f"❌ Error encrypting {original_path}: {e}")
