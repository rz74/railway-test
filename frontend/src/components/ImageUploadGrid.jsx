import React, { useState } from 'react';

function ImageUploadGrid() {
  const [images, setImages] = useState(Array(10).fill(null));           // holds File objects
  const [filenames, setFilenames] = useState(Array(10).fill(''));       // holds custom names
  const [indices, setIndices] = useState(Array(10).fill(''));
  const [targetUrl, setTargetUrl] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleFileChange = (index, file) => {
    if (!file) return;
    const newImages = [...images];
    const newNames = [...filenames];
    newImages[index] = file;
    newNames[index] = file.name.replace(/\.[^/.]+$/, ""); // default to original filename without extension
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
  const allIndexed = indices.every(val => val >= 1 && val <= 10);
  const noDuplicates = getConflictingIndices().size === 0;

  const formValid = allFilled && allIndexed && noDuplicates;

  const handleSubmit = () => {
    console.log({ images, filenames, indices, targetUrl });
    // TODO: send all form data to backend
  };

  return (
    <div className="space-y-6">
      {images.map((img, i) => {
        const file = images[i];
        const previewUrl = file ? URL.createObjectURL(file) : null;
        const selectedIndex = indices[i];
        const fileName = filenames[i];

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
                {selectedIndex && (
                  <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
                    {selectedIndex}
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-2 h-32 flex items-center justify-center bg-gray-700 rounded text-gray-400 text-sm border border-dashed border-gray-500">
                Drag & Drop or Select Image
              </div>
            )}

            {file && (
              <div className="mt-2">
                <label className="text-sm text-gray-300">Rename file:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => handleRename(i, e.target.value)}
                  className="w-full mt-1 rounded px-2 py-1 text-black"
                />
              </div>
            )}

            <select
              value={selectedIndex || ''}
              onChange={(e) => handleIndexChange(i, e.target.value)}
              className="mt-2 w-full rounded px-2 py-1 text-black"
            >
              <option value="">Select index</option>
              {[...Array(10)].map((_, idx) => {
                const val = idx + 1;
                const isUsed = indices.includes(val) && indices[i] !== val;

                return (
                  <option key={val} value={val} disabled={isUsed}>
                    {val}
                  </option>
                );
              })}
            </select>
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
