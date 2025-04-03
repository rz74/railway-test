import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState(Array(10).fill(null));
  const [indices, setIndices] = useState(Array.from({ length: 10 }, (_, i) => i + 1));
  const [deliveryMode, setDeliveryMode] = useState("jump");
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [loading, setLoading] = useState(false);
  const [netlifyToken, setNetlifyToken] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value);
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices(Array.from({ length: count }, (_, i) => i + 1));
  };

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  const handleIndexChange = (i, value) => {
    const newIndices = [...indices];
    newIndices[i] = value === "" ? null : parseInt(value);
    setIndices(newIndices);
  };

  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images.");
      return;
    }
    if (new Set(indices.filter(Boolean)).size !== numImages) {
      alert("All indices must be uniquely selected.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
      formData.append("filenames[]", file.name.split(".")[0]);
    });
    indices.forEach((val) => formData.append("indices[]", val));
    formData.append("targetUrl", targetUrl);
    formData.append("deliveryMode", deliveryMode);
    formData.append("title", title);
    formData.append("failMessage", failMessage);
    formData.append("netlifyToken", netlifyToken);

    try {
      setLoading(true);
      const res = await axios.post("/generate-site", formData);
      if (res.data && res.data.site_url) {
        setDeployedUrl(res.data.site_url);
      } else {
        alert("Error: Deployment failed.");
      }
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Network error: Could not contact server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-2">🧠 Memory Puzzle Uploader</h1>
      <p className="text-sm text-gray-300 mb-4">
        Upload images, choose display index, and generate your puzzle.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm mb-1">Number of Images (5–50):</label>
          <input
            type="number"
            min={5}
            max={50}
            className="w-24 px-2 py-1 rounded text-black"
            value={numImages}
            onChange={handleNumChange}
          />
        </div>

        <div className="border-2 border-dashed p-6 rounded bg-gray-800">
          <p className="text-md mb-4 font-semibold">Upload your images</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: numImages }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(i, e.target.files[0])}
                  className="text-sm"
                />
                <select
                  value={indices[i] || ""}
                  onChange={(e) => handleIndexChange(i, e.target.value)}
                  className="text-black text-sm rounded w-28"
                >
                  <option value="">Not selected</option>
                  {Array.from({ length: numImages }, (_, j) => j + 1).map(n => (
                    <option
                      key={n}
                      value={n}
                      disabled={indices.includes(n) && indices[i] !== n}
                    >
                      {n}
                    </option>
                  ))}
                </select>
                <div className="w-10 h-10 bg-blue-600 text-white text-[10px] flex justify-center items-center rounded border border-blue-300">
                  Drop here/Preview
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Target URL"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-3 py-2 rounded text-black"
          />
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="px-3 py-2 rounded text-black"
          >
            <option value="mirror">Mirror</option>
            <option value="jump">Jump</option>
          </select>
          <input
            type="text"
            placeholder="Page Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded text-black"
          />
          <input
            type="text"
            placeholder="Failure Message"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="px-3 py-2 rounded text-black"
          />
          <input
            type="text"
            placeholder="Netlify Access Token"
            value={netlifyToken}
            onChange={(e) => setNetlifyToken(e.target.value)}
            className="px-3 py-2 rounded text-black col-span-2"
          />
          <a
            href="https://app.netlify.com/user/applications#personal-access-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline text-sm col-span-2"
          >
            How to get a Netlify access token?
          </a>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={handleBuild}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Build Puzzle Site"}
          </button>
        </div>

        {deployedUrl && (
          <p className="mt-4 text-green-400">
            ✅ Site deployed:{" "}
            <a
              href={deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {deployedUrl}
            </a>
          </p>
        )}

        <p className="mt-4 text-sm text-blue-400 underline">
          <a
            href="https://github.com/rz74/Memory-Puzzle-Web-App"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
