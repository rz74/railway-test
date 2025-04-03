import React, { useState } from 'react';
import axios from 'axios';

const ImageUploadGrid = () => {
  const [numImages, setNumImages] = useState(10);
  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [indices, setIndices] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState("mirror");
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("Secret Puzzle");
  const [failMessage, setFailMessage] = useState("Wrong again? Try harder!");
  const [zipBlob, setZipBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleNumChange = (e) => {
    const count = Math.max(5, Math.min(50, parseInt(e.target.value)));
    setNumImages(count);
    setImages(Array(count).fill(null));
    setLabels(Array(count).fill(""));
    setIndices(Array.from({ length: count }, (_, i) => i + 1));
  };

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    const newLabels = [...labels];
    newImages[i] = file;
    newLabels[i] = file.name.split(".")[0];
    setImages(newImages);
    setLabels(newLabels);
  };

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

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDropThumbnail = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const newLabels = [...labels];
    [newImages[draggedIndex], newImages[index]] = [newImages[index], newImages[draggedIndex]];
    [newLabels[draggedIndex], newLabels[index]] = [newLabels[index], newLabels[draggedIndex]];
    setImages(newImages);
    setLabels(newLabels);
    setDraggedIndex(null);
  };

  const usedIndices = new Set(indices);

  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
    });
    labels.forEach(label => formData.append("filenames[]", label));
    indices.forEach(index => formData.append("indices[]", index));
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

      <div
        onDrop={handleDropZone}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed p-8 rounded bg-gray-800 text-center"
      >
        <p className="mb-4 text-gray-400">Drag & drop your images here</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {Array.from({ length: numImages }, (_, i) => (
            <div
              key={i}
              className="space-y-1 p-1 border rounded"
              draggable={!!images[i]}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropThumbnail(i)}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />
              <input
                type="text"
                placeholder={`Label ${i + 1}`}
                value={labels[i] || ""}
                onChange={(e) => {
                  const newLabels = [...labels];
                  newLabels[i] = e.target.value;
                  setLabels(newLabels);
                }}
                className="w-full px-1 py-1 rounded text-black text-sm"
              />
              <select
                value={indices[i]}
                onChange={(e) => {
                  const newIndices = [...indices];
                  newIndices[i] = parseInt(e.target.value);
                  setIndices(newIndices);
                }}
                className="w-full px-1 py-1 rounded text-black text-sm"
              >
                {Array.from({ length: numImages }, (_, j) => j + 1).map(j => (
                  <option
                    key={j}
                    value={j}
                    disabled={indices.includes(j) && indices[i] !== j}
                  >
                    {j}
                  </option>
                ))}
              </select>
              {images[i] && (
                <img
                  src={URL.createObjectURL(images[i])}
                  alt="thumb"
                  className="w-12 h-12 object-cover rounded border mx-auto"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Failure Message</label>
          <input
            type="text"
            value={failMessage}
            onChange={(e) => setFailMessage(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Target URL</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-3 py-2 rounded text-black w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Redirect Mode</label>
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

      <div>
        <label className="block text-sm mb-1">Reorder Images</label>
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => img && (
            <img
              key={i}
              src={URL.createObjectURL(img)}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDrop={() => handleDropThumbnail(i)}
              onDragOver={(e) => e.preventDefault()}
              className="w-12 h-12 object-cover border rounded cursor-move"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4 items-center">
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

      <div className="text-center pt-6 text-sm text-gray-500">
        <a
          href="https://github.com/rz74/"
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
