import { useEffect, useState, useCallback } from "react";
import { getMenu, createMenu, deleteMenu } from "../api/menu.api";
import ImageUploader from "../components/ImageUploader";

const CATEGORIES = [
  { value: "kota", label: "Kota", icon: "🥪" },
  { value: "drink", label: "Drinks", icon: "🥤" },
  { value: "side", label: "Sides", icon: "🍟" },
  { value: "combo", label: "Combos", icon: "🍱" },
  { value: "other", label: "Other", icon: "🍽️" },
];

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-300 animate-slide-in ${styles[type]}`}>
      <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-sm font-bold">
        {icons[type]}
      </span>
      <div>
        <p className="font-semibold text-sm capitalize">{type}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 transition">
        ✕
      </button>
    </div>
  );
};

// Toast Hook
const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
};

// Stat Card Component
const StatCard = ({ label, value, trend, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

// Empty State Component
const EmptyState = ({ onAction }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
      🍽️
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items yet</h3>
    <p className="text-gray-500 mb-6 text-center max-w-md">
      Get started by adding your first menu item. Fill out the form above to create your digital menu.
    </p>
    <button 
      onClick={onAction}
      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
    >
      Add First Item
    </button>
  </div>
);

// Menu Item Card Component
const MenuItemCard = ({ item, onDelete, deleting }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="relative h-48 overflow-hidden bg-gray-100">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <span className="text-5xl">🖼️</span>
        </div>
      )}
      <div className="absolute top-3 left-3">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-sm">
          {CATEGORIES.find(c => c.value === item.category)?.icon} {item.category}
        </span>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        disabled={deleting}
        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 flex items-center justify-center shadow-lg"
        title="Delete item"
      >
        {deleting ? '...' : '×'}
      </button>
    </div>
    
    <div className="p-5">
      <h4 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{item.name}</h4>
      {item.description && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">{item.description}</p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-2xl font-bold text-gray-900">
          R{item.price?.toFixed(2)}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          ID: {item.id?.slice(-6)}
        </span>
      </div>
    </div>
  </div>
);

export default function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "kota",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMenu();
      setMenu(res.data);
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to load menu items", 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.price || parseFloat(form.price) <= 0) errors.price = "Valid price required";
    if (!form.category) errors.category = "Category is required";
    if (!image) errors.image = "Image is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addMenu = async () => {
    if (!validateForm()) {
      showToast("Please fix the form errors", "warning");
      return;
    }

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
      const errorMsg = err.response?.data?.detail || err.message;
      showToast(`Upload failed: ${errorMsg}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteMenu(id);
      setMenu((prev) => prev.filter((m) => m.id !== id));
      showToast("Item deleted successfully", "success");
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Delete failed", 
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: menu.length,
    categories: [...new Set(menu.map(m => m.category))].length,
    avgPrice: menu.length > 0 
      ? (menu.reduce((acc, m) => acc + (m.price || 0), 0) / menu.length).toFixed(2)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          key={toast.id}
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Menu Manager
            </h1>
            <p className="text-gray-500">Manage your digital menu items and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={load}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            label="Total Items" 
            value={stats.total} 
            trend={12} 
            icon="🍔" 
          />
          <StatCard 
            label="Categories" 
            value={stats.categories} 
            trend={0} 
            icon="📂" 
          />
          <StatCard 
            label="Average Price" 
            value={`R${stats.avgPrice}`} 
            trend={-5} 
            icon="💰" 
          />
        </div>

        {/* Add Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
              ➕
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
              <p className="text-sm text-gray-500">Create a new menu item with details and image</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name *</label>
              <input
                className={`w-full border ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="e.g., Classic Kota"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (formErrors.name) setFormErrors({...formErrors, name: null});
                }}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (R) *</label>
              <input
                className={`w-full border ${formErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value });
                  if (formErrors.price) setFormErrors({...formErrors, price: null});
                }}
              />
              {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category *</label>
              <select
                className={`w-full border ${formErrors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
              <input
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Optional details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${formErrors.image ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} ${image ? 'border-blue-400 bg-blue-50' : ''}`}>
            <ImageUploader onUpload={(file) => {
              setImage(file);
              if (formErrors.image) setFormErrors({...formErrors, image: null});
            }} />
            {formErrors.image && <p className="text-xs text-red-500 mt-2 text-center">{formErrors.image}</p>}
            {image && <p className="text-xs text-blue-600 mt-2 text-center font-medium">✓ Image selected: {image.name}</p>}
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400">* Required fields</p>
            <button
              onClick={addMenu}
              disabled={uploading}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-gray-900/20"
            >
              {uploading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span>+</span>
                  Add Menu Item
                </>
              )}
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Menu Items ({menu.length})</h2>
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button 
                key={c.value}
                className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition"
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : menu.length === 0 ? (
          <EmptyState onAction={() => document.querySelector('input')?.focus()} />
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menu.map((m) => (
              <MenuItemCard 
                key={m.id} 
                item={m} 
                onDelete={handleDelete}
                deleting={deletingId === m.id}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
