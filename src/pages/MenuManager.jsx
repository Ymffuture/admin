import { useEffect, useState } from "react";
import { getMenu, createMenu, deleteMenu } from "../api/menu.api";
import ImageUploader from "../components/ImageUploader";

// BUG FIX: missing category field (backend requires it)
const CATEGORIES = ["kota", "drink", "side", "combo", "other"];

export default function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "kota",
    description: "",
  });
  const [image, setImage] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMenu();
      setMenu(res.data);
    } catch (err) {
      alert("Failed to load menu: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addMenu = async () => {
    if (!form.name || !form.price || !form.category) {
      alert("Please fill name, price and category");
      return;
    }
    if (!image) {
      alert("Please upload an image");
      return;
    }

    try {
      setUploading(true);
      // BUG FIX 1: old code built FormData here then passed it to createMenu
      //   which ALSO tried to build FormData → double-wrapped, backend rejected it
      // BUG FIX 2: old code used field "image" — backend expects "file"
      // BUG FIX 3: missing category field
      // Now we just pass a plain object; menu.api.js handles the FormData
      await createMenu({
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        description: form.description,
        file: image,
      });

      setForm({ name: "", price: "", category: "kota", description: "" });
      setImage(null);
      load();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteMenu(id);
      setMenu((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🍔 Menu Manager</h2>

      {/* ADD FORM */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-10">
        <h3 className="text-xl font-semibold mb-4">Add Menu Item</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            className="border p-3 rounded-lg"
            placeholder="Item Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg"
            placeholder="Price (R)"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          {/* BUG FIX: added missing category selector */}
          <select
            className="border p-3 rounded-lg bg-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <input
            className="border p-3 rounded-lg"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <ImageUploader onUpload={setImage} />

        <button
          onClick={addMenu}
          disabled={uploading}
          className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Add Item"}
        </button>
      </div>

      {/* MENU GRID */}
      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading menu...</p>
      ) : menu.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No menu items yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menu.map((m) => (
            <div key={m.id} className="bg-white shadow rounded-xl overflow-hidden">
              {/* BUG FIX: was m.image — backend returns m.image_url */}
              {m.image_url && (
                <img
                  src={m.image_url}
                  alt={m.name}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {m.category}
                </span>
                <h4 className="font-bold text-lg mt-0.5">{m.name}</h4>
                {m.description && (
                  <p className="text-gray-500 text-sm mt-1">{m.description}</p>
                )}
                <p className="text-xl font-semibold mt-2">
                  R{m.price?.toFixed(2)}
                </p>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="mt-3 w-full text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
