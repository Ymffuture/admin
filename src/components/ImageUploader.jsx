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
    <div>

      <input type="file" onChange={handleChange} />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mt-3 h-32 rounded"
        />
      )}

    </div>
  );
}
