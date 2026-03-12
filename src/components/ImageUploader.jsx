import { useState } from "react";

export default function ImageUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Menu Image
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
      />
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mt-2 h-32 w-32 object-cover rounded-lg border"
        />
      )}
    </div>
  );
}
