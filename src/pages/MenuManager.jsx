import { useEffect, useState, useCallback } from "react";
import { getMenu, createMenu, deleteMenu } from "../api/menu.api";
import ImageUploader from "../components/ImageUploader";

const CATEGORIES = [
  { value: "kota",  label: "Kota",   icon: "🥪" },
  { value: "drink", label: "Drinks", icon: "🥤" },
  { value: "side",  label: "Sides",  icon: "🍟" },
  { value: "combo", label: "Combos", icon: "🍱" },
  { value: "other", label: "Other",  icon: "🍽️" },
];

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };
  const icon = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      background: bg[type] ?? bg.info, color: "#fff",
      padding: "14px 20px", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      fontFamily: "system-ui, sans-serif", fontSize: 14, fontWeight: 600,
      animation: "toastSlide 0.3s ease",
    }}>
      <span style={{ fontSize: 16 }}>{icon[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 12, background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}>×</button>
      {/* ✅ FIX: was <style jsx> — "jsx" is not a valid HTML attribute and causes React to
          throw an error unless you have styled-components/emotion installed.
          This project uses none of those — plain <style> is the correct fix. */}
      <style>{`@keyframes toastSlide { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = "info") => setToast({ message, type, id: Date.now() }), []);
  const hideToast = useCallback(() => setToast(null), []);
  return { toast, showToast, hideToast };
};

/* ── Stat Card ── */
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-3xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

/* ── Menu Item Card ── */
const MenuItemCard = ({ item, onDelete, deleting }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="relative h-48 overflow-hidden bg-gray-100">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">🖼️</div>
      )}
      <div className="absolute top-3 left-3">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-sm">
          {CATEGORIES.find(c => c.value === item.category)?.icon} {item.category}
        </span>
      </div>
      <button onClick={() => onDelete(item.id)} disabled={deleting}
        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 flex items-center justify-center shadow-lg text-lg font-bold"
        title="Delete item">
        {deleting ? "…" : "×"}
      </button>
    </div>
    <div className="p-5">
      <h4 className="font-bold text-lg text-gray-900 mb-1 truncate">{item.name}</h4>
      {item.description && (
        <p className="text-gray-500 text-sm mb-3 overflow-hidden" style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {item.description}
        </p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-2xl font-bold text-gray-900">R{item.price?.toFixed(2)}</span>
        <span className="text-xs text-gray-400 font-medium">ID: {item.id?.slice(-6)}</span>
      </div>
    </div>
  </div>
);

/* ── Main ── */
export default function MenuManager() {
  const [menu, setMenu]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm]       = useState({ name: "", price: "", category: "kota", description: "" });
  const [image, setImage]     = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMenu();
      setMenu(res.data);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load menu items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                     e.name  = "Name is required";
    if (!form.price || parseFloat(form.price) <= 0) e.price = "Valid price required";
    if (!form.category)                        e.category = "Category is required";
    if (!image)                                e.image = "Image is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const addMenu = async () => {
    if (!validate()) { showToast("Please fix the form errors", "warning"); return; }
    try {
      setUploading(true);
      await createMenu({
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category,
        description: form.description.trim(),
        file: image,
      });
      setForm({ name: "", price: "", category: "kota", description: "" });
      setImage(null);
      setFormErrors({});
      showToast("Menu item added successfully!", "success");
      load();
    } catch (err) {
      const msg = err.response?.data?.detail;
      const detail = Array.isArray(msg) ? msg.map(d => d.msg).join(" · ") : (msg || err.message);
      showToast(`Upload failed: ${detail}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteMenu(id);
      setMenu(prev => prev.filter(m => m.id !== id));
      showToast("Item deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.detail || "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: menu.length,
    categories: [...new Set(menu.map(m => m.category))].length,
    avgPrice: menu.length
      ? (menu.reduce((a, m) => a + (m.price || 0), 0) / menu.length).toFixed(2)
      : "0.00",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Menu Manager</h1>
            <p className="text-gray-500">Add and manage your digital menu items</p>
          </div>
          <button onClick={load} disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2 self-start">
            <span className={loading ? "inline-block animate-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Items"    value={stats.total}          icon="🍔" />
          <StatCard label="Categories"     value={stats.categories}     icon="📂" />
          <StatCard label="Average Price"  value={`R${stats.avgPrice}`} icon="💰" />
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">➕</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
              <p className="text-sm text-gray-500">Fill in the details and upload an image</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name *</label>
              <input
                className={`w-full border ${formErrors.name ? "border-red-300 bg-red-50" : "border-gray-200"} p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="e.g., Classic Kota"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors(p => ({ ...p, name: null })); }}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (R) *</label>
              <input
                className={`w-full border ${formErrors.price ? "border-red-300 bg-red-50" : "border-gray-200"} p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="0.00" type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => { setForm({ ...form, price: e.target.value }); setFormErrors(p => ({ ...p, price: null })); }}
              />
              {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category *</label>
              <select
                className="w-full border border-gray-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
              <input
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Optional details..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${formErrors.image ? "border-red-300 bg-red-50" : image ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
            <ImageUploader onUpload={file => { setImage(file); setFormErrors(p => ({ ...p, image: null })); }} />
            {formErrors.image && <p className="text-xs text-red-500 mt-2 text-center">{formErrors.image}</p>}
            {image && <p className="text-xs text-blue-600 mt-2 text-center font-medium">✓ Image selected: {image.name}</p>}
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400">* Required fields</p>
            <button onClick={addMenu} disabled={uploading}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-gray-900/20">
              {uploading ? <><span className="animate-spin inline-block">⟳</span> Uploading…</> : <><span>+</span> Add Menu Item</>}
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Menu Items ({menu.length})</h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <span className="text-5xl mb-4">🍽️</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items yet</h3>
            <p className="text-gray-500 text-center max-w-sm mb-6">Add your first item using the form above.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menu.map(m => (
              <MenuItemCard key={m.id} item={m} onDelete={handleDelete} deleting={deletingId === m.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
