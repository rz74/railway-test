from flask import send_file
import os

SECRETS_DIR = os.environ.get("PUZZLE_SECRETS_DIR", "./backend/secrets")

def serve_key():
    return send_file(os.path.join(SECRETS_DIR, "key.txt"), mimetype="text/plain")

def serve_index_map():
    return send_file(os.path.join(SECRETS_DIR, "index-map.json"), mimetype="application/json")

def serve_obfuscation_map():
    return send_file(os.path.join(SECRETS_DIR, "obfuscation-map.json"), mimetype="application/json")

def serve_target():
    return send_file(os.path.join(SECRETS_DIR, "target.txt"), mimetype="text/plain")

def serve_mode():
    return send_file(os.path.join(SECRETS_DIR, "delivery-mode.txt"), mimetype="text/plain")
