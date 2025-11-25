import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        if (files[0].type.startsWith('image/')) {
          onImageSelected(files[0]);
        } else {
          alert('Please upload an image file.');
        }
      }
    },
    [onImageSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onImageSelected(files[0]);
      }
    },
    [onImageSelected]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out cursor-pointer group
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-full transition-colors duration-200 ${isDragging ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
          <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700">
            Click or drag image to upload
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Supports JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
};
