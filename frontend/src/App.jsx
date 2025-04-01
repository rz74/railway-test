import React from 'react';
import ImageUploadGrid from './components/ImageUploadGrid';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold">🧠 Memory Puzzle Uploader</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Upload 10 images, label and index them, and deploy your personalized puzzle site.
        </p>
      </header>
      <main>
        <ImageUploadGrid />
      </main>
    </div>
  );
}

export default App;
