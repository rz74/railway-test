
from flask import Flask, request, jsonify, send_file, make_response, send_from_directory
from flask_cors import CORS
import tempfile
import os
from utils.build_site import build_puzzle_site
from utils.deploy_to_netlify import deploy_to_netlify
import logging

app = Flask(__name__)
CORS(app)  # Allow all routes and origins

logging.basicConfig(level=logging.INFO)
print("ðŸ”¥ app started")

@app.route("/", methods=["GET"])
def index():
    logging.info("Index route accessed")
    return "ðŸš€ Backend is running!"

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route("/generate-site", methods=["POST"])
def generate_site():
    try:
        logging.info("ðŸš€ STARTED /generate-site route")
        logging.info("ðŸ“ Form keys: %s", list(request.form.keys()))
        logging.info("ðŸ“Ž File keys: %s", list(request.files.keys()))

        netlify_token = request.form.get("netlifyToken")
        target_url = request.form.get("targetUrl")
        delivery_mode = request.form.get("deliveryMode")

        filenames = request.form.getlist("filenames[]")
        indices = request.form.getlist("indices[]")

        if not netlify_token:
            raise ValueError("Missing Netlify token")
        if not target_url:
            raise ValueError("Missing target URL")
        if not filenames or not indices or len(filenames) != 10 or len(indices) != 10:
            raise ValueError("Expected 10 filenames and 10 indices")

        logging.info("âœ… Received target: %s", target_url)
        logging.info("ðŸ§© Delivery mode: %s", delivery_mode)
        logging.info("ðŸ§  Filenames: %s", filenames)
        logging.info("ðŸ”¢ Indices: %s", indices)

        with tempfile.TemporaryDirectory() as tmpdir:
            image_paths = []
            for i in range(10):
                file = request.files.get(f"image{i}")
                if not file:
                    raise ValueError(f"Missing image{i}")
                save_path = os.path.join(tmpdir, f"{i}_{file.filename}")
                file.save(save_path)
                image_paths.append(save_path)

            logging.info("ðŸ“· Saved all uploaded images")

            zip_path, site_path = build_puzzle_site(
                image_paths=image_paths,
                labels=filenames,
                indices=[int(idx) for idx in indices],
                target_url=target_url,
                delivery_mode=delivery_mode,
                output_dir=os.path.join(tmpdir, "output")
            )

            logging.info("ðŸ“¦ Site built, starting deploy...")

            deploy_result = deploy_to_netlify(site_path, netlify_token)
            if not deploy_result["success"]:
                raise Exception("Deploy failed: " + deploy_result["error"])

            logging.info("âœ… Deploy successful: %s", deploy_result["url"])

            with open(zip_path, "rb") as f:
                zip_data = f.read()

            response = make_response(zip_data)
            response.headers["Content-Type"] = "application/zip"
            response.headers["Content-Disposition"] = f"attachment; filename=puzzle_site.zip"
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["X-Netlify-URL"] = deploy_result["url"]
            return response

    except Exception as e:
        logging.error("âŒ Exception during /generate-site: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
