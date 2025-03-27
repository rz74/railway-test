from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tempfile
import os
from utils.build_site import build_puzzle_site
from utils.deploy_to_netlify import deploy_to_netlify

app = Flask(__name__)
CORS(app, resources={r"/generate-site": {"origins": "*"}})

print("🔥 app started")

@app.route("/generate-site", methods=["POST"])
def generate_site():
    try:
        print("🚀 STARTED /generate-site route")

        print("📝 Form keys:", list(request.form.keys()))
        print("📎 File keys:", list(request.files.keys()))

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

        print("✅ Received target:", target_url)
        print("🧩 Delivery mode:", delivery_mode)
        print("🧠 Filenames:", filenames)
        print("🔢 Indices:", indices)

        # Don't use tempfile.TemporaryDirectory() since we want to preserve the ZIP for download
        working_dir = os.path.join(os.getcwd(), "temp_sites")
        os.makedirs(working_dir, exist_ok=True)

        image_paths = []
        for i in range(10):
            file = request.files.get(f"image{i}")
            if not file:
                raise ValueError(f"Missing image{i}")
            save_path = os.path.join(working_dir, f"{i}_{file.filename}")
            file.save(save_path)
            image_paths.append(save_path)

        print("📷 Saved all uploaded images")

        zip_path, site_path = build_puzzle_site(
            image_paths=image_paths,
            labels=filenames,
            indices=[int(idx) for idx in indices],
            target_url=target_url,
            delivery_mode=delivery_mode,
            output_dir=working_dir
        )

        print("📦 Site built, starting deploy...")

        # deploy_result = deploy_to_netlify(site_path, netlify_token)
        # if not deploy_result["success"]:
        #     raise Exception("Deploy failed: " + deploy_result["error"])
        
        if not deploy_result["success"]:
            print("⚠️ Deploy failed, but sending ZIP for debugging.")
            return send_file(
                zip_path,
                mimetype='application/zip',
                as_attachment=True,
                download_name='puzzle_site.zip'
    )


        print("✅ Deploy successful:", deploy_result["url"])

        # Send the zip file to the frontend as a download
        return send_file(
            zip_path,
            mimetype='application/zip',
            as_attachment=True,
            download_name='puzzle_site.zip'
        )

    except Exception as e:
        print("❌ Exception during /generate-site:", e)
        return jsonify({"error": str(e)}), 500
