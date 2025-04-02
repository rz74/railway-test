import React, { useState } from 'react';
import { BACKEND_URL } from '../../path_config';

function ImageUploadGrid() {
  const [imageCount, setImageCount] = useState(10);
  const [images, setImages] = useState(Array(10).fill(null));
  const [filenames, setFilenames] = useState(Array(10).fill(''));
  const [indices, setIndices] = useState(Array.from({ length: 10 }, (_, i) => i + 1));
  const [targetUrl, setTargetUrl] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('jump');
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [deployedUrl, setDeployedUrl] = useState('');

  const handleImageCountChange = (count) => {
    const c = parseInt(count, 10);
    setImageCount(c);
    setImages(Array(c).fill(null));
    setFilenames(Array(c).fill(''));
    setIndices(Array.from({ length: c }, (_, i) => i + 1));
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    const newImages = [...images];
    const newNames = [...filenames];
    newImages[index] = file;
    newNames[index] = file.name.replace(/\.[^/.]+$/, '');
    setImages(newImages);
    setFilenames(newNames);
  };

  const handleRename = (index, value) => {
    const newNames = [...filenames];
    newNames[index] = value;
    setFilenames(newNames);
  };

  const handleIndexChange = (index, value) => {
    const num = parseInt(value, 10);
    const newIndices = [...indices];
    newIndices[index] = isNaN(num) ? '' : num;
    setIndices(newIndices);
  };

  const getConflictingIndices = () => {
    const counts = {};
    indices.forEach(val => {
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    const conflicts = new Set();
    indices.forEach((val, idx) => {
      if (val && counts[val] > 1) {
        conflicts.add(idx);
      }
    });
    return conflicts;
  };

  const allFilled = images.every(img => img !== null);
  const allIndexed = indices.every(val => val >= 1 && val <= imageCount);
  const noDuplicates = getConflictingIndices().size === 0;
  const formValid = allFilled && allIndexed && noDuplicates && targetUrl;

  const handleSubmit = async () => {
    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append(`image${i}`, file);
    });
    filenames.forEach(name => formData.append("filenames[]", name));
    indices.forEach(index => formData.append("indices[]", index));
    formData.append("targetUrl", targetUrl);
    formData.append("deliveryMode", deliveryMode);

    try {
      const res = await fetch(`${BACKEND_URL}/generate-site`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("❌ Error: " + (err.error || "Something went wrong"));
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "puzzle_site.zip";
      a.click();
      window.URL.revokeObjectURL(url);

      setDeployedUrl("https://www.google.com"); // temporary placeholder
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Network error: Could not contact server.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold mb-2">Number of Images</label>
        <select
          value={imageCount}
          onChange={(e) => handleImageCountChange(e.target.value)}
          className="w-full rounded px-2 py-1 text-black"
        >
          {Array.from({ length: 46 }, (_, i) => i + 5).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>

      {images.map((img, i) => {
        const previewUrl = img ? URL.createObjectURL(img) : null;
        const isUsed = indices.filter(idx => idx === indices[i]).length > 1;

        return (
          <div
            key={i}
            className={`bg-gray-800 p-4 rounded relative border-2 transition ${
              dragOverIndex === i ? 'border-blue-400' : 'border-transparent'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(i);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverIndex(null);
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                handleFileChange(i, file);
              }
            }}
          >
            <label className="block font-semibold mb-2">Image {i + 1}</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(i, e.target.files[0])}
              className="text-white"
            />

            {previewUrl ? (
              <div className="relative mt-2">
                <img
                  src={previewUrl}
                  alt={`Preview ${i + 1}`}
                  className="h-32 w-auto object-cover rounded border border-gray-500"
                />
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
                  {indices[i]}
                </span>
              </div>
            ) : (
              <div className="mt-2 h-32 flex items-center justify-center bg-gray-700 rounded text-gray-400 text-sm border border-dashed border-gray-500">
                Drag & Drop or Select Image
              </div>
            )}

            {img && (
              <>
                <div className="mt-2">
                  <label className="text-sm text-gray-300">Rename:</label>
                  <input
                    type="text"
                    value={filenames[i]}
                    onChange={(e) => handleRename(i, e.target.value)}
                    className="w-full mt-1 rounded px-2 py-1 text-black"
                  />
                </div>

                <select
                  value={indices[i] || ''}
                  onChange={(e) => handleIndexChange(i, e.target.value)}
                  className="mt-2 w-full rounded px-2 py-1 text-black"
                >
                  <option value="">Select index</option>
                  {Array.from({ length: imageCount }, (_, idx) => {
                    const val = idx + 1;
                    const disabled = indices.includes(val) && indices[i] !== val;
                    return (
                      <option key={val} value={val} disabled={disabled}>
                        {val}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
          </div>
        );
      })}

      <div>
        <label className="block font-semibold mb-2">Target URL</label>
        <input
          type="url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="w-full rounded px-2 py-1 text-black"
          placeholder="https://example.com"
        />
      </div>

      <div className="mt-4">
        <label className="block font-semibold mb-2">Delivery Mode</label>
        <select
          value={deliveryMode}
          onChange={(e) => setDeliveryMode(e.target.value)}
          className="w-full rounded px-2 py-1 text-black"
        >
          <option value="jump">Jump (redirect)</option>
          <option value="mirror">Mirror (embed)</option>
        </select>
      </div>

      {deployedUrl && (
        <div className="mt-4 text-green-400 text-sm">
          ✅ Site deployed at:{' '}
          <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {deployedUrl}
          </a>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!formValid}
        className={`px-4 py-2 rounded mt-4 text-white ${
          formValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'
        }`}
      >
        Build Puzzle Site
      </button>
    </div>
  );
}

export default ImageUploadGrid;
