import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState([]);
  const [indices, setIndices] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState("mirror");
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("Secret Puzzle:");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value);
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices(Array(count).fill(""));
  };

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  const handleIndexChange = (i, newIndex) => {
    const newIndices = [...indices];
    newIndices[i] = newIndex === "" ? "" : parseInt(newIndex);
    setIndices(newIndices);
  };

  const usedIndices = (skipIndex = -1) =>
    indices.filter((val, i) => i !== skipIndex && val !== "");

  const handleBuild = async () => {
    if (images.some(img => !img) || indices.some(idx => idx === "")) {
      alert("Please upload all images and assign indices.");
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
      <h1 className="text-3xl font-bold">🧠 Memory Puzzle Uploader</h1>
      <p className="text-sm text-gray-400 mb-2">
        Upload {numImages} images, choose display index, and generate your puzzle.
      </p>

      <div>
        <label className="block mb-1">Number of Images (5–50):</label>
        <input
          type="number"
          min={5}
          max={50}
          value={numImages}
          onChange={handleNumChange}
          className="w-24 px-2 py-1 rounded text-black"
        />
      </div>

      <div className="space-y-3">
        {Array.from({ length: numImages }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(i, e.target.files[0])}
            />
            <select
              value={indices[i]}
              onChange={(e) => handleIndexChange(i, e.target.value)}
              className="text-black px-2 py-1 rounded"
            >
              <option value="">Not selected</option>
              {Array.from({ length: numImages }, (_, idx) => {
                const val = idx + 1;
                const alreadyUsed = usedIndices(i).includes(val);
                return (
                  <option key={val} value={val} disabled={alreadyUsed}>
                    {val}
                  </option>
                );
              })}
            </select>
            <div className="w-20 h-10 bg-blue-500 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Target URL</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Redirect Mode</label>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="w-full px-2 py-1 rounded text-black"
          >
            <option value="mirror">Mirror</option>
            <option value="jump">Jump</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 mt-4 items-center">
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

      <div className="text-sm text-gray-400 mt-4">
        <a
          href="https://github.com/rz74/Memory-Puzzle-Web-App"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View Source on GitHub
        </a>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
