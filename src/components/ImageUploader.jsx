import { useState } from "react";

export default function ImageUploader({ onUpload }) {

  const [file, setFile] = useState(null);

  const handleUpload = () => {

    const form = new FormData();

    form.append("image", file);

    onUpload(form);
  };

  return (
    <div>

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button onClick={handleUpload}>
        Upload
      </button>

    </div>
  );
}
