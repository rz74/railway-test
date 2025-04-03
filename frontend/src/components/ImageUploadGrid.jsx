import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState(Array(10).fill(null));
  const [indices, setIndices] = useState(Array.from({ length: 10 }, (_, i) => i + 1));
  const [targetUrl, setTargetUrl] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('jump'); // Default to "jump"
  const [title, setTitle] = useState('Secret Puzzle');
  const [failMessage, setFailMessage] = useState('Wrong again? Try harder!');
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update defaults when numImages changes
    setImages(Array(numImages).fill(null));
    setIndices(Array.from({ length: numImages }, (_, i) => i + 1));
  }, [numImages]);

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  const handleIndexChange = (i, val) => {
    const newIndices = [...indices];
    newIndices[i] = val;
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
      formData.append("filenames[]", file.name.split(".")[0]);
      formData.append("indices[]", indices[i]);
    });
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

  const usedIndices = new Set(indices);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-2">🧠 Memory Puzzle Uploader</h1>
      <p className="text-sm text-gray-300 mb-4">Upload images, choose display index, and generate your puzzle.</p>

      <div>
        <label className="block text-sm mb-1">Number of Images (5–50):</label>
        <input
          type="number"
          min={5}
          max={50}
          value={numImages}
          onChange={(e) => setNumImages(Number(e.target.value))}
          className="w-24 px-2 py-1 rounded text-black"
        />
      </div>

      <div className="border-2 border-dashed p-6 rounded bg-gray-900">
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
                className="text-black text-sm rounded w-28"
                value={indices[i]}
                onChange={(e) => handleIndexChange(i, parseInt(e.target.value))}
              >
                <option value="">Not selected</option>
                {Array.from({ length: numImages }, (_, j) => j + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              {/* <div className="w-20 h-10 bg-blue-500 text-white text-xs flex justify-center items-center rounded border border-blue-300">
                {images[i] ? "Preview" : "Drop here"}
              </div> */}
              {/* <div className="w-24 h-24 bg-blue-500 text-white text-xs flex justify-center items-center rounded border-4 border-blue-700 shadow-md">
                {images[i] ? "Preview" : "Drop here"}
              </div> */}
              <div className="w-28 h-28 bg-blue-600 text-white font-semibold text-sm flex justify-center items-center rounded-lg border-4 border-blue-800 shadow-lg">
                {images[i] ? "Preview" : "Drop here"}
              </div>


            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Target URL</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
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
            className="w-full px-3 py-2 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
          />
        </div>
      </div>

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

      <div className="mt-4 text-sm text-blue-400 underline">
        <a href="https://github.com/rz74/Memory-Puzzle-Web-App" target="_blank" rel="noreferrer">
          View Source on GitHub
        </a>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
