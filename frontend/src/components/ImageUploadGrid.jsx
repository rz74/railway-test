import React, { useState } from "react";
import axios from "axios";

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState(Array(10).fill(null));
  const [labels, setLabels] = useState(Array(10).fill(""));
  const [indices, setIndices] = useState(Array.from({ length: 10 }, (_, i) => i + 1));
  const [deliveryMode, setDeliveryMode] = useState("mirror");
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value);
    const safeCount = Math.max(5, Math.min(50, count));
    setNumImages(safeCount);
    setImages(Array(safeCount).fill(null));
    setLabels(Array(safeCount).fill(""));
    setIndices(Array.from({ length: safeCount }, (_, i) => i + 1));
  };

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);

    const newLabels = [...labels];
    newLabels[i] = file.name.split(".")[0];
    setLabels(newLabels);
  };

  const handleLabelChange = (i, value) => {
    const newLabels = [...labels];
    newLabels[i] = value;
    setLabels(newLabels);
  };

  const handleIndexChange = (i, value) => {
    const newIndices = [...indices];
    newIndices[i] = parseInt(value);
    setIndices(newIndices);
  };

  const usedIndices = new Set(indices);

  const handleDropZone = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).slice(0, numImages);
    const newImages = [...images];
    const newLabels = [...labels];

    dropped.forEach((file, i) => {
      newImages[i] = file;
      newLabels[i] = file.name.split(".")[0];
    });

    setImages(newImages);
    setLabels(newLabels);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleBuild = async () => {
    if (images.some((img) => !img)) {
      alert("Please upload all images.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
    });
    labels.forEach((label) => formData.append("filenames[]", label));
    indices.forEach((index) => formData.append("indices[]", index));
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

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">🧠 Memory Puzzle Uploader</h1>
      <p className="text-sm text-gray-400">
        Upload {numImages} images, label and index them, and deploy your personalized puzzle site.
      </p>

      <label className="block text-sm mb-1 mt-2">Number of Images (5–50):</label>
      <input
        type="number"
        min={5}
        max={50}
        value={numImages}
        onChange={handleNumChange}
        className="w-24 px-2 py-1 rounded text-black"
      />

      <div
        onDrop={handleDropZone}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-400 p-4 rounded bg-gray-800 text-center mt-2"
      >
        <p className="mb-4 text-gray-400">Drag & drop your images here</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: numImages }, (_, i) => (
            <div key={i} className="bg-gray-700 p-2 rounded space-y-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />
              <input
                type="text"
                placeholder={`Label ${i + 1}`}
                value={labels[i] || ""}
                onChange={(e) => handleLabelChange(i, e.target.value)}
                className="w-full px-2 py-1 text-sm rounded text-black"
              />
              <select
                value={indices[i]}
                onChange={(e) => handleIndexChange(i, e.target.value)}
                className="w-full px-2 py-1 text-sm rounded text-black"
              >
                {Array.from({ length: numImages }, (_, j) => (
                  <option
                    key={j + 1}
                    value={j + 1}
                    disabled={indices.includes(j + 1) && indices[i] !== j + 1}
                  >
                    {j + 1}
                  </option>
                ))}
              </select>
              {images[i] && (
                <img
                  src={URL.createObjectURL(images[i])}
                  alt="thumbnail"
                  className="w-6 h-6 object-cover rounded border mx-auto"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block">Page Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
        />
        <label className="block">Failure Message</label>
        <input
          type="text"
          value={failMessage}
          onChange={(e) => setFailMessage(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
        />
        <label className="block">Target URL</label>
        <input
          type="text"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
        />
        <label className="block">Redirect Mode</label>
        <select
          value={deliveryMode}
          onChange={(e) => setDeliveryMode(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
        >
          <option value="mirror">Mirror (same tab)</option>
          <option value="jump">Jump (new tab)</option>
        </select>
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

      <div className="text-right pt-4">
        <a
          href="https://github.com/rz74/"
          target="_blank"
          className="text-sm underline text-gray-400 hover:text-white"
          rel="noreferrer"
        >
          View source on GitHub
        </a>
      </div>
    </div>
  );
};

export default ImageUploadGrid;
