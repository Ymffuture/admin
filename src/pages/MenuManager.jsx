import { useEffect, useState } from "react";
import { getMenu, createMenu } from "../api/menu.api";
import ImageUploader from "../components/ImageUploader";

export default function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  const [image, setImage] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMenu();
      setMenu(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = (file) => {
    setImage(file);
  };

  const addMenu = async () => {
    if (!form.name || !form.price || !image) {
      alert("Fill all fields");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("image", image);

      await createMenu(formData);

      setForm({ name: "", price: "", description: "" });
      setImage(null);

      load();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* TITLE */}
      <h2 className="text-3xl font-bold mb-6">
        🍔 Menu Manager
      </h2>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-10">

        <h3 className="text-xl font-semibold mb-4">
          Add Menu Item
        </h3>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            className="border p-3 rounded-lg"
            placeholder="Menu Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="border p-3 rounded-lg"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <input
            className="border p-3 rounded-lg"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

        </div>

        <div className="mt-4">
          <ImageUploader onUpload={handleUpload} />
        </div>

        <button
          onClick={addMenu}
          disabled={uploading}
          className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          {uploading ? "Uploading..." : "Add Menu"}
        </button>

      </div>

      {/* MENU GRID */}
      {loading ? (
        <p>Loading menu...</p>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">

          {menu.map((m) => (
            <div
              key={m.id}
              className="bg-white shadow rounded-xl overflow-hidden"
            >

              {m.image && (
                <img
                  src={m.image}
                  alt={m.name}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-4">

                <h4 className="font-bold text-lg">
                  {m.name}
                </h4>

                <p className="text-gray-600 text-sm">
                  {m.description}
                </p>

                <p className="text-xl font-semibold mt-2">
                  R{m.price}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}
