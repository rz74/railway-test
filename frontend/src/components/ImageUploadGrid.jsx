import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState([]);
  const [indices, setIndices] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState("mirror");
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize image/index arrays when count changes
  const handleNumChange = (e) => {
    const count = Math.max(5, Math.min(50, parseInt(e.target.value)));
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices(Array(count).fill(null));
  };

  // Handle file uploads
  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  // Handle display index selection
  const handleIndexChange = (i, value) => {
    const newIndices = [...indices];
    newIndices[i] = parseInt(value);
    setIndices(newIndices);
  };

  // Submit to backend
  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images.");
      return;
    }
    if (indices.some(index => !index)) {
      alert("Please assign all display indices.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => formData.append(`image${i}`, file));
    images.forEach((file, i) => formData.append("filenames[]", file.name.split(".")[0]));
    indices.forEach(i => formData.append("indices[]", i));
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

      {/* Number of images selector */}
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

      {/* Upload UI */}
      <div className="border-2 border-dashed p-4 rounded bg-gray-100 text-black">
        <p className="mb-4 font-medium">Upload your images</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: numImages }, (_, i) => {
            const usedIndices = new Set(indices.filter((val, idx) => val && idx !== i));
            return (
              <div key={i} className="space-y-2 flex flex-col items-center">
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
                  {Array.from({ length: numImages }, (_, j) => (
                    <option
                      key={j + 1}
                      value={j + 1}
                      disabled={usedIndices.has(j + 1)}
                    >
                      {j + 1}
                    </option>
                  ))}
                </select>
                {/* Blue Box */}
                <div className="w-20 h-10 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                  Drop here/Preview
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Text inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
        <div>
          <label className="text-sm">Target URL</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-3 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="text-sm">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="px-3 py-1 rounded w-full"
          >
            <option value="mirror">Mirror</option>
            <option value="jump">Jump</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="text-sm">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="px-3 py-1 rounded w-full"
          />
        </div>
      </div>

      {/* Submission buttons */}
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

      {/* GitHub link */}
      <p className="text-sm text-blue-500 underline mt-4">
        <a href="https://github.com/rz74/Memory-Puzzle-Web-App" target="_blank" rel="noreferrer">
          View source on GitHub
        </a>
      </p>
    </div>
  );
};

export default ImageUploadGrid;
