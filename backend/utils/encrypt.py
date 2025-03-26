import os
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from PIL import Image

def convert_to_jpg(image_path):
    if image_path.lower().endswith(".jpg") or image_path.lower().endswith(".jpeg"):
        return image_path
    img = Image.open(image_path)
    new_path = image_path.rsplit(".", 1)[0] + ".jpg"
    rgb = img.convert("RGB")
    rgb.save(new_path, "JPEG")
    return new_path

def encrypt_image(path, key):
    path = convert_to_jpg(path)
    with open(path, "rb") as f:
        plaintext = f.read()

    nonce = get_random_bytes(12)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)

    final = nonce + tag + ciphertext
    return final

def encrypt_images(image_paths, key, output_dir, label_to_obfuscated):
    os.makedirs(output_dir, exist_ok=True)
    for label, path in label_to_obfuscated.items():
        enc_data = encrypt_image(path, key)
        out_path = os.path.join(output_dir, label + ".enc")
        with open(out_path, "wb") as f:
            f.write(enc_data)
