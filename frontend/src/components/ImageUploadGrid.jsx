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
    const newIndices = [...indices];
    newIndices[index] = value;
    setIndices(newIndices);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    images.forEach((img, i) => {
      if (img) formData.append('images', img);
      formData.append('index_' + i, indices[i]);
    });
    formData.append('targetUrl', targetUrl);

    await fetch('/api/build', { method: 'POST', body: formData });
    alert('Submitted!');
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {images.map((_, i) => (
          <div key={i} className="border p-2 rounded bg-gray-800">
            <input type="file" accept="image/*" onChange={e => handleFileChange(i, e.target.files[0])} />
            <input
              type="number"
              placeholder="Index (1-10)"
              className="w-full mt-1 text-black"
              value={indices[i]}
              onChange={e => handleIndexChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>
      <input
        className="mt-4 p-2 w-full text-black"
        placeholder="Target URL"
        value={targetUrl}
        onChange={e => setTargetUrl(e.target.value)}
      />
      <button className="mt-4 bg-green-600 px-4 py-2 rounded" onClick={handleSubmit}>Build Puzzle</button>
    </div>
  );
}

export default ImageUploadGrid;