from flask import Flask, request, jsonify, send_file, make_response, send_from_directory
from flask_cors import CORS
import os
import tempfile
from utils.build_site import build_puzzle_site
from utils.path_config import STATIC_DIR
from static_handlers import (
    serve_key,
    serve_index_map,
    serve_obfuscation_map,
    serve_target,
    serve_mode,
)

app = Flask(__name__)
CORS(app)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(STATIC_DIR, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

# === Serve frontend assets for mono-deployment ===
@app.route('/<path:path>', methods=["GET"])
def serve_frontend_file(path):
    return send_from_directory(os.path.join(app.root_path, "static"), path)

@app.route("/", methods=["GET"])
def root():
    return send_from_directory(os.path.join(app.root_path, "static"), "index.html")

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
        title = form.get("title", "Secret Puzzle")
        fail_message = form.get("failMessage", "Wrong again? Try harder!")

        if not (5 <= len(filenames) <= 50) or not (5 <= len(indices) <= 50):
            return jsonify({"error": "Expected 5 to 50 filenames and indices"}), 400
        if not target_url:
            return jsonify({"error": "Missing target URL"}), 400
        if not delivery_mode:
            return jsonify({"error": "Missing delivery mode"}), 400

        with tempfile.TemporaryDirectory() as tmpdir:
            image_paths = []
            for i in range(len(filenames)):
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
                output_dir=tmpdir,
                title=title,
                fail_message=fail_message
            )

            with open(zip_path, "rb") as f:
                data = f.read()

            response = make_response(data)
            response.headers["Content-Type"] = "application/zip"
            response.headers["Content-Disposition"] = "attachment; filename=puzzle_site.zip"
            return response

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
