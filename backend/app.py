from flask import Flask, request, jsonify, send_file, make_response, send_from_directory
from flask_cors import CORS
import os
import tempfile
from utils.build_site import build_puzzle_site
from utils.path_config import STATIC_DIR  # central path config
from static_handlers import (
    serve_key,
    serve_index_map,
    serve_obfuscation_map,
    serve_target,
    serve_mode
)

app = Flask(__name__)
CORS(app)

# === Favicon route ===
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(STATIC_DIR, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

# === Secret file serving routes ===
@app.route("/get-key", methods=["GET"])
def serve_key_route():
    return serve_key()

@app.route("/get-index-map", methods=["GET"])
def serve_index_map_route():
    return serve_index_map()

@app.route("/get-obfuscation-map", methods=["GET"])
def serve_obfuscation_map_route():
    return serve_obfuscation_map()

@app.route("/get-target", methods=["GET"])
def serve_target_route():
    return serve_target()

@app.route("/get-delivery-mode", methods=["GET"])
def serve_mode_route():
    return serve_mode()

# === Site generation route ===
@app.route("/generate-site", methods=["POST"])
def generate_site():
    try:
        form = request.form
        files = request.files

        filenames = form.getlist("filenames[]")
        indices = list(map(int, form.getlist("indices[]")))
        target_url = form.get("targetUrl")
        delivery_mode = form.get("deliveryMode")

        if len(filenames) != 10 or len(indices) != 10:
            return jsonify({"error": "Expected 10 filenames and indices"}), 400
        if not target_url:
            return jsonify({"error": "Missing target URL"}), 400
        if not delivery_mode:
            return jsonify({"error": "Missing delivery mode"}), 400

        with tempfile.TemporaryDirectory() as tmpdir:
            image_paths = []
            for i in range(10):
                f = files.get(f"image{i}")
                if not f:
                    return jsonify({"error": f"Missing image{i}"}), 400
                save_path = os.path.join(tmpdir, f"{i}_{f.filename}")
                f.save(save_path)
                image_paths.append(save_path)

            zip_path, _ = build_puzzle_site(
                image_paths=image_paths,
                labels=filenames,
                indices=indices,
                target_url=target_url,
                delivery_mode=delivery_mode,
                output_dir=tmpdir
            )

            with open(zip_path, "rb") as f:
                data = f.read()

            response = make_response(data)
            response.headers["Content-Type"] = "application/zip"
            response.headers["Content-Disposition"] = "attachment; filename=puzzle_site.zip"
            return response

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# === Serve frontend files ===
@app.route("/assets/<path:path>")
def serve_assets(path):
    return send_from_directory(os.path.join(STATIC_DIR, "assets"), path)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(STATIC_DIR, "index.html")
    return "⚠️ Frontend not built yet.", 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
