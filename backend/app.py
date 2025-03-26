
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
import tempfile
from utils.encrypt import encrypt_images
from utils.build_site import build_puzzle_site
from utils.deploy_to_netlify import deploy_to_netlify

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit

NETLIFY_TOKEN = os.environ.get("NETLIFY_TOKEN")  

@app.route("/generate-site", methods=["POST"])
def generate_site():
    if not NETLIFY_TOKEN:
        return jsonify({"error": "Missing Netlify API token"}), 500

    try:
        images = []
        for i in range(10):
            image_file = request.files.get(f"image{i}")
            if not image_file:
                return jsonify({"error": f"Missing image{i}"}), 400
            images.append((f"image{i}", image_file))

        filenames = request.form.getlist("filenames[]")
        indices = request.form.getlist("indices[]")
        target_url = request.form.get("targetUrl")
        delivery_mode = request.form.get("deliveryMode", "jump")

        if not (len(filenames) == len(indices) == 10):
            return jsonify({"error": "Expected 10 filenames and 10 indices."}), 400

        with tempfile.TemporaryDirectory() as tmpdir:
            input_dir = os.path.join(tmpdir, "input")
            os.makedirs(input_dir, exist_ok=True)

            image_paths = []
            for i, (field, file) in enumerate(images):
                path = os.path.join(input_dir, secure_filename(file.filename))
                file.save(path)
                image_paths.append(path)

            build_dir = os.path.join(tmpdir, "output")
            os.makedirs(build_dir, exist_ok=True)

            puzzle_site_path = build_puzzle_site(
                image_paths=image_paths,
                labels=filenames,
                indices=[int(i) for i in indices],
                target_url=target_url,
                delivery_mode=delivery_mode,
                output_dir=build_dir
            )

            deploy_result = deploy_to_netlify(puzzle_site_path, NETLIFY_TOKEN)
            return jsonify(deploy_result), 200 if deploy_result["success"] else 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
