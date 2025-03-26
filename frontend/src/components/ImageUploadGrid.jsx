import React, { useState } from 'react';

function ImageUploadGrid() {
  const [images, setImages] = useState(Array(10).fill(null));
  const [indices, setIndices] = useState(Array(10).fill(''));
  const [targetUrl, setTargetUrl] = useState('');

  const handleFileChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
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
    console.log({ images, indices, targetUrl });
    // TODO: send to backend
  };

  return (
    <div className="space-y-6">
      {images.map((img, i) => {
        const file = images[i];
        const previewUrl = file ? URL.createObjectURL(file) : null;
        const selectedIndex = indices[i];

        return (
          <div key={i} className="bg-gray-800 p-4 rounded relative">
            <label className="block font-semibold mb-2">Image {i + 1}</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(i, e.target.files[0])}
              className="text-white"
            />

            {previewUrl && (
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
