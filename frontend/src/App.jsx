import React from 'react';
import ImageUploadGrid from './components/ImageUploadGrid';

function App() {
  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Memory Puzzle Upload</h1>
      <ImageUploadGrid />
    </div>
  );
}

export default App;