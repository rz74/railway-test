
import React, { useState } from 'react';
import axios from 'axios';

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

  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
    const newLabels = [...labels];
    newLabels[i] = file.name.split(".")[0];
    setLabels(newLabels);
  };

  const handleDrop = (e) => {
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

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value);
    setNumImages(count);
    setImages(Array(count).fill(null));
    setLabels(Array(count).fill(""));
    setIndices(Array.from({ length: count }, (_, i) => i + 1));
  };

  const handleBuild = async () => {
    if (images.some(img => !img)) {
      alert("Please upload all images before submitting.");
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed p-4 rounded bg-gray-800"
      >
        <p className="text-center mb-4">Drag & drop images here</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: numImages }, (_, i) => (
            <div key={i} className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />
              <input
                type="text"
                placeholder={`Label ${i + 1}`}
                value={labels[i]}
                onChange={(e) => {
                  const newLabels = [...labels];
                  newLabels[i] = e.target.value;
                  setLabels(newLabels);
                }}
                className="w-full px-2 py-1 rounded text-black"
              />
              {images[i] && (
                <img
                  src={URL.createObjectURL(images[i])}
                  alt="thumb"
                  className="w-full h-32 object-cover rounded border"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Target URL"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="px-3 py-2 rounded text-black"
        />
        <select
          value={deliveryMode}
          onChange={(e) => setDeliveryMode(e.target.value)}
          className="px-3 py-2 rounded text-black"
        >
          <option value="mirror">Mirror</option>
          <option value="jump">Jump</option>
        </select>
        <input
          type="text"
          placeholder="Page Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Failure Message"
          value={failMessage}
          onChange={(e) => setFailMessage(e.target.value)}
          className="px-3 py-2 rounded text-black"
        />
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
    </div>
  );
};

export default ImageUploadGrid;
