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
    const count = parseInt(e.target.value);
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
    newIndices[i] = parseInt(val);
    setIndices(newIndices);
  };

  const getUsedIndices = () => {
    return indices.filter((idx, i) => idx !== null && images[i] !== null);
  };

  const handleBuild = async () => {
    if (images.some(img => !img) || indices.some(i => i == null)) {
      alert("Please upload all images and assign unique indices.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => formData.append(`image${i}`, file));
    images.forEach((img, i) => formData.append("filenames[]", img.name));
    indices.forEach((idx) => formData.append("indices[]", idx));
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
      {/* Image count selector */}
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

      {/* Image upload section */}
      <div className="border-2 border-dashed p-6 rounded bg-gray-100">
        <p className="mb-4 font-medium">Upload your images</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: numImages }).map((_, i) => {
            const used = getUsedIndices();
            return (
              <div key={i} className="space-y-1 flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(i, e.target.files[0])}
                  className="text-sm"
                />
                <select
                  value={indices[i] ?? ""}
                  onChange={(e) => handleIndexChange(i, e.target.value)}
                  className="text-black text-sm rounded w-28"
                >
                  <option value="">Not selected</option>
                  {Array.from({ length: numImages }, (_, j) => (
                    <option
                      key={j}
                      value={j + 1}
                      disabled={used.includes(j + 1) && indices[i] !== j + 1}
                    >
                      {j + 1}
                    </option>
                  ))}
                </select>

                {/* ✅ Always show blue box */}
                <div className="w-20 h-10 bg-blue-500 rounded" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-sm mb-1">Target URL</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          >
            <option value="mirror">Mirror</option>
            <option value="jump">Jump</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="flex gap-4 items-center mt-4">
        <button
          onClick={handleBuild}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Build Puzzle Site"}
        </button>
        {zipBlob && (
          <a
            href={URL.createObjectURL(zipBlob)}
            download="puzzle_site.zip"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download ZIP
          </a>
        )}
      </div>

      {/* GitHub source */}
      <p className="text-sm text-blue-600 mt-4 underline">
        <a href="https://github.com/rz74/Memory-Puzzle-Web-App" target="_blank" rel="noopener noreferrer">
          View source on GitHub
        </a>
      </p>
    </div>
  );
};

export default ImageUploadGrid;
