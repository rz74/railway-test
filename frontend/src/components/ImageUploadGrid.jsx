import React, { useState } from "react";
import axios from "axios";

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

  // When number of images is updated
  const handleNumChange = (e) => {
    const count = parseInt(e.target.value);
    setNumImages(count);
    setImages(Array(count).fill(null));
    setIndices(Array(count).fill(null));
  };

  // When a file is uploaded
  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  // When index dropdown is changed
  const handleIndexChange = (i, value) => {
    const newIndices = [...indices];
    newIndices[i] = value === "" ? null : parseInt(value);
    setIndices(newIndices);
  };

  const handleBuild = async () => {
    if (images.some((img) => !img)) {
      alert("Please upload all images.");
      return;
    }
    if (indices.some((index) => index === null)) {
      alert("Please assign indices to all images.");
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

  // Determine which indices are already used
  const usedIndices = new Set(indices.filter((x) => x !== null));

  return (
    <div className="space-y-6">
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

      {/* Upload grid */}
      <div className="border-2 border-dashed p-6 rounded bg-gray-800 text-center">
        <p className="mb-4 text-gray-400">Upload your images</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: numImages }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Upload field */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />

              {/* Index dropdown */}
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

              {/* Always-visible blue box */}
              <div className="w-12 h-12 bg-blue-500 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Metadata inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Target URL:</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Redirect Mode:</label>
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
          <label className="block text-sm mb-1">Page Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Failure Message:</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
          />
        </div>
      </div>

      {/* Build/download buttons */}
      <div className="flex gap-4 items-center mt-4">
        <button
          onClick={handleBuild}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Build Site"}
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
      <div className="mt-6 text-sm text-center">
        <a
          href="https://github.com/rz74/Memory-Puzzle-Web-App"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          View source on GitHub
        </a>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
