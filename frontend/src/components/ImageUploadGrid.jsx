import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState([]);
  const [indices, setIndices] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("mirror");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  // Keep track of used indices to disable them in dropdowns
  const usedIndices = new Set(indices.filter(Boolean));

  const handleNumChange = (e) => {
    const count = Math.max(5, Math.min(50, parseInt(e.target.value)));
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices(Array(count).fill(""));
  };

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  const handleIndexChange = (i, value) => {
    const newIndices = [...indices];
    newIndices[i] = parseInt(value) || "";
    setIndices(newIndices);
  };

  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images.");
      return;
    }
    if (indices.some(idx => !idx)) {
      alert("Please assign a display index to every image.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
    });
    images.forEach((file, i) => {
      const label = file.name.split(".")[0];
      formData.append("filenames[]", label);
    });
    indices.forEach(idx => {
      formData.append("indices[]", idx);
    });
    formData.append("targetUrl", targetUrl);
    formData.append("deliveryMode", deliveryMode);
    formData.append("title", title);
    formData.append("failMessage", failMessage);

    try {
      setLoading(true);
      const res = await axios.post("/generate-site", formData, {
        responseType: "blob"
      });
      setZipBlob(res.data);
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Network error: Could not contact server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-2">🧠 Memory Puzzle Uploader</h1>
      <p className="text-sm text-gray-400 mb-4">
        Upload {numImages} images, choose display index, and generate your puzzle.
      </p>

      {/* Number of images input */}
      <div>
        <label className="block text-sm mb-1">Number of Images (5–50):</label>
        <input
          type="number"
          min={5}
          max={50}
          value={numImages}
          onChange={handleNumChange}
          className="w-24 px-2 py-1 rounded text-black"
        />
      </div>

      {/* Upload inputs with blue boxes */}
      <div className="space-y-4">
        {Array.from({ length: numImages }, (_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />
              <select
                value={indices[i] ?? ""}
                onChange={(e) => handleIndexChange(i, e.target.value)}
                className="px-2 py-1 rounded text-black"
              >
                <option value="">Not selected</option>
                {Array.from({ length: numImages }, (_, j) => j + 1).map((num) => (
                  <option
                    key={num}
                    value={num}
                    disabled={usedIndices.has(num) && indices[i] !== num}
                  >
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Always-visible blue box */}
            <div className="w-20 h-6 bg-blue-500 rounded" />
          </div>
        ))}
      </div>

      {/* Puzzle configuration inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm block">Target URL</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="text-sm block">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          >
            <option value="mirror">Mirror</option>
            <option value="jump">Jump</option>
          </select>
        </div>
        <div>
          <label className="text-sm block">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="text-sm block">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
      </div>

      {/* Build + Download buttons */}
      <div className="flex gap-4 items-center mt-4">
        <button
          onClick={handleBuild}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Build Puzzle Site"}
        </button>
        {zipBlob && (
          <a
            href={URL.createObjectURL(zipBlob)}
            download="puzzle_site.zip"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Download ZIP
          </a>
        )}
      </div>

      {/* GitHub link */}
      <div className="text-sm text-purple-300 mt-4">
        <a href="https://github.com/rz74/Memory-Puzzle-Web-App" target="_blank" rel="noopener noreferrer">
          View Source on GitHub
        </a>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
