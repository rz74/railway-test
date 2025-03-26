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

  const handleSubmit = () => {
    console.log({ images, indices, targetUrl });
    // TODO: send data to backend
  };

  return (
    <div className="space-y-6">
      {images.map((img, i) => (
        <div key={i} className="bg-gray-800 p-4 rounded">
          <label className="block font-semibold mb-2">Image {i + 1}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(i, e.target.files[0])}
            className="text-white"
          />

          <select
            value={indices[i] || ''}
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
      ))}

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
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Build Puzzle Site
      </button>
    </div>
  );
}

export default ImageUploadGrid;
