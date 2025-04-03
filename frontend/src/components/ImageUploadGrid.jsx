import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState(Array(10).fill(null));
  const [indices, setIndices] = useState(Array(10).fill(null));
  const [deliveryMode, setDeliveryMode] = useState("mirror");
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNumChange = (e) => {
    const count = Math.max(5, Math.min(50, parseInt(e.target.value) || 10));
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices(Array(count).fill(null));
  };

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  const handleIndexChange = (i, val) => {
    const newIndices = [...indices];
    newIndices[i] = parseInt(val) || null;
    setIndices(newIndices);
  };

  const usedIndices = indices.filter(i => i !== null);

  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images.");
      return;
    }
    if (indices.some(idx => idx === null)) {
      alert("Please assign all indices.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
      formData.append("filenames[]", file.name.split(".")[0]);
    });
    indices.forEach(index => formData.append("indices[]", index));
    formData.append("targetUrl", targetUrl);
    formData.append("deliveryMode", deliveryMode);
    formData.append("title", title);
    formData.append("failMessage", failMessage);

    try {
      setLoading(true);
      const res = await axios.post("/generate-site", formData, { responseType: "blob" });
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
      <h1 className="text-3xl font-bold">🧠 Memory Puzzle Uploader</h1>
      <p className="text-gray-300 text-sm">Upload {numImages} images, choose display index, and generate your puzzle.</p>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: numImages }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(i, e.target.files[0])}
            />
            <select
              value={indices[i] || ""}
              onChange={(e) => handleIndexChange(i, e.target.value)}
              className="px-2 py-1 text-black rounded"
            >
              <option value="">Not selected</option>
              {Array.from({ length: numImages }, (_, j) => j + 1).map(n => (
                <option
                  key={n}
                  value={n}
                  disabled={usedIndices.includes(n) && indices[i] !== n}
                >
                  {n}
                </option>
              ))}
            </select>
            <div className="w-10 h-10 bg-blue-500 rounded-md"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm block mb-1">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Target URL</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          >
            <option value="mirror">Mirror</option>
            <option value="jump">Jump</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 items-center">
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

      <div className="text-sm text-purple-300 underline mt-2">
        <a href="https://github.com/rz74/Memory-Puzzle-Web-App" target="_blank" rel="noreferrer">
          View Source on GitHub
        </a>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
