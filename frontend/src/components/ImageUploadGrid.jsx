import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState(Array(10).fill(null));
  const [indices, setIndices] = useState([...Array(10)].map((_, i) => i + 1));
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [deliveryMode, setDeliveryMode] = useState("jump");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNumChange = (e) => {
    const count = Math.min(50, Math.max(5, parseInt(e.target.value)));
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices([...Array(count)].map((_, i) => i + 1));
  };

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const handleIndexChange = (i, value) => {
    const newIndices = [...indices];
    newIndices[i] = parseInt(value);
    setIndices(newIndices);
  };

  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
    });
    images.forEach((img, i) => {
      const label = img.name.split(".")[0];
      formData.append("filenames[]", label);
    });
    indices.forEach((ind) => formData.append("indices[]", ind));
    formData.append("targetUrl", targetUrl);
    formData.append("deliveryMode", deliveryMode);
    formData.append("title", title);
    formData.append("failMessage", failMessage);

    try {
      setLoading(true);
      const res = await axios.post("/generate-site", formData, {
        responseType: "blob",
      });
      setZipBlob(res.data);
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Network error: Could not contact server.");
    } finally {
      setLoading(false);
    }
  };

  const usedIndices = new Set(indices);

  return (
    <main className="space-y-6 text-white">
      <h1 className="text-4xl font-bold mb-2">🧠 Memory Puzzle Uploader</h1>
      <p className="text-sm text-gray-300 mb-4">
        Upload images, choose display index, and generate your puzzle.
      </p>

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

      <div className="border-2 border-dashed p-6 rounded bg-gray-800">
        <p className="text-md mb-4 font-semibold">Upload your images</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: numImages }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
                className="text-sm"
              />
              <select
                value={indices[i]}
                onChange={(e) => handleIndexChange(i, e.target.value)}
                className="text-black text-sm rounded w-28"
              >
                <option disabled value="">
                  Not selected
                </option>
                {Array.from({ length: numImages }, (_, j) => j + 1).map((val) => (
                  <option
                    key={val}
                    value={val}
                    disabled={
                      indices[i] !== val && usedIndices.has(val)
                    }
                  >
                    {val}
                  </option>
                ))}
              </select>
              {/* 💠 Always show blue square as visual cue */}
              <div className="w-10 h-10 bg-blue-500 border border-blue-300 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm block mb-1">Target URL</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-2 py-1 rounded text-black w-full"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="px-2 py-1 rounded text-black w-full"
          >
            <option value="jump">Jump (redirect)</option>
            <option value="mirror">Mirror (inline)</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Page Title</label>
          <input
            type="text"
            placeholder="Secret Puzzle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-2 py-1 rounded text-black w-full"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Failure Message</label>
          <input
            type="text"
            placeholder="Wrong again?"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="px-2 py-1 rounded text-black w-full"
          />
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

      <p className="mt-4 text-sm text-blue-400 underline">
        <a href="https://github.com/rz74/Memory-Puzzle-Web-App" target="_blank" rel="noopener noreferrer">
          View source on GitHub
        </a>
      </p>
    </main>
  );
};

export default ImageUploadGrid;
