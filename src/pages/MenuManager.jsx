import { useEffect, useState, useCallback, useRef } from "react";
import { getMenu, createMenu, deleteMenu, analyzeMenuWithAI, generateAIDescription } from "../api/menu.api";
import ImageUploader from "../components/ImageUploader";

// AI Feature Icons
const AIIcons = {
  Sparkles: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
      <path d="M5 3L6 5L8 6L6 7L5 9L4 7L2 6L4 5L5 3Z" />
      <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" />
    </svg>
  ),
  MagicWand: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2l2-3 2 6 2-3h2" />
    </svg>
  ),
  Trending: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Robot: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
      <path d="M9 21v2" />
      <path d="M15 21v2" />
    </svg>
  ),
  Brain: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  )
};

const CATEGORIES = [
  { value: "kota", label: "Kota", icon: "🥪", color: "from-orange-400 to-red-500" },
  { value: "drink", label: "Drinks", icon: "🥤", color: "from-blue-400 to-cyan-500" },
  { value: "side", label: "Sides", icon: "🍟", color: "from-yellow-400 to-orange-500" },
  { value: "combo", label: "Combos", icon: "🍱", color: "from-purple-400 to-pink-500" },
  { value: "other", label: "Other", icon: "🍽️", color: "from-gray-400 to-gray-600" },
];

/* ── Smart Toast with AI styling ── */
const Toast = ({ message, type, onClose, isAI }) => {
  useEffect(() => {
    const t = setTimeout(onClose, isAI ? 6000 : 4000);
    return () => clearTimeout(t);
  }, [onClose, isAI]);

  const styles = {
    success: "from-emerald-500 to-teal-600",
    error: "from-red-500 to-rose-600",
    warning: "from-amber-500 to-orange-600",
    info: "from-blue-500 to-indigo-600",
    ai: "from-violet-500 to-fuchsia-600"
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
    ai: "✨"
  };

  const bgClass = styles[isAI ? "ai" : type] || styles.info;
  const icon = icons[isAI ? "ai" : type] || icons.info;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white transform transition-all duration-500 animate-slide-in bg-gradient-to-r ${bgClass} ${isAI ? 'ring-2 ring-violet-300 ring-opacity-50' : ''}`}>
      <span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full text-lg backdrop-blur-sm">
        {icon}
      </span>
      <div className="max-w-xs">
        <p className="font-semibold text-sm">{isAI ? "AI Assistant" : type}</p>
        <p className="text-sm opacity-90 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition">
        ×
      </button>
    </div>
  );
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = "info", isAI = false) => {
    setToast({ message, type, isAI, id: Date.now() });
  }, []);
  const hideToast = useCallback(() => setToast(null), []);
  return { toast, showToast, hideToast };
};

/* ── AI Suggestion Card ── */
const AISuggestionCard = ({ suggestion, onApply, onDismiss }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl p-5 mb-6 animate-fade-in">
    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
    
    <div className="relative flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg">
        <AIIcons.Sparkles />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full uppercase tracking-wider">AI Suggestion</span>
          <span className="text-xs text-violet-500">{suggestion.confidence}% confidence</span>
        </div>
        
        <h4 className="font-bold text-gray-900 mb-1">{suggestion.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onApply(suggestion)}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
          >
            Apply
          </button>
          <button 
            onClick={onDismiss}
            className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── Smart Stat Card with trend ── */
const StatCard = ({ label, value, trend, trendUp, icon, isAI }) => (
  <div className={`group relative bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isAI ? 'border-violet-200 bg-gradient-to-br from-violet-50/50 to-white' : 'border-gray-100'}`}>
    {isAI && (
      <div className="absolute top-3 right-3">
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
        </span>
      </div>
    )}
    
    <div className="flex items-center justify-between mb-4">
      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    
    <p className={`text-3xl font-bold ${isAI ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
      {value}
    </p>
    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
      {label}
      {isAI && <AIIcons.Brain />}
    </p>
  </div>
);

/* ── Enhanced Menu Item Card with AI insights ── */
const MenuItemCard = ({ item, onDelete, deleting, aiInsight }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
    <div className="relative h-48 overflow-hidden bg-gray-100">
      {item.image_url ? (
        <img 
          src={item.image_url} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">🖼️</div>
      )}
      
      {/* AI Insight Badge */}
      {aiInsight && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            <AIIcons.Sparkles />
            {aiInsight}
          </div>
        </div>
      )}
      
      <div className="absolute top-3 right-3">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
          {CATEGORIES.find(c => c.value === item.category)?.icon} {item.category}
        </span>
      </div>
      
      {/* Hover overlay with quick actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
        <button 
          onClick={() => onDelete(item.id)} 
          disabled={deleting}
          className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition transform hover:scale-110 shadow-lg"
        >
          {deleting ? "…" : "×"}
        </button>
        
        <button className="px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-full hover:bg-gray-100 transition shadow-lg flex items-center gap-2">
          <AIIcons.MagicWand />
          AI Optimize
        </button>
      </div>
    </div>
    
    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h4>
        {item.aiScore && (
          <span className="flex-shrink-0 px-2 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg">
            AI: {item.aiScore}/10
        </span>
        )}
      </div>
      
      {item.description && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">{item.description}</p>
      )}
      
      {/* AI Tags */}
      {item.aiTags && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.aiTags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-2xl font-bold text-gray-900">R{item.price?.toFixed(2)}</span>
        <span className="text-xs text-gray-400 font-medium">ID: {item.id?.slice(-6)}</span>
      </div>
    </div>
  </div>
);

/* ── AI Assistant Panel ── */
const AIAssistantPanel = ({ isOpen, onClose, onGenerateDescription, analyzing }) => (
  <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-500 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <AIIcons.Robot />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-xs text-white/80">Powered by SmartMenu AI</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">×</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
          <h4 className="font-semibold text-violet-900 mb-2 flex items-center gap-2">
            <AIIcons.MagicWand />
            Quick Actions
          </h4>
          <div className="space-y-2">
            <button 
              onClick={onGenerateDescription}
              disabled={analyzing}
              className="w-full p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 hover:shadow-md transition text-left flex items-center gap-3 disabled:opacity-50"
            >
              <span className="text-2xl">✍️</span>
              <div>
                <p className="font-medium text-gray-900">Generate Descriptions</p>
                <p className="text-xs text-gray-500">AI-write enticing menu descriptions</p>
              </div>
            </button>
            
            <button className="w-full p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 hover:shadow-md transition text-left flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium text-gray-900">Price Optimization</p>
                <p className="text-xs text-gray-500">Get AI pricing recommendations</p>
              </div>
            </button>
            
            <button className="w-full p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-400 hover:shadow-md transition text-left flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium text-gray-900">Category Suggestions</p>
                <p className="text-xs text-gray-500">Optimize menu organization</p>
              </div>
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AIIcons.Trending />
            Insights
          </h4>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Your best-selling category is <strong>Combos</strong></p>
            <p>• Consider adding more premium items</p>
            <p>• Average menu rating: 4.2/5</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main Component ── */
export default function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const { toast, showToast, hideToast } = useToast();

  const [form, setForm] = useState({ name: "", price: "", category: "kota", description: "" });
  const [image, setImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [aiGeneratedDesc, setAiGeneratedDesc] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMenu();
      // Simulate AI-enhanced data
      const enhancedData = res.data.map(item => ({
        ...item,
        aiScore: Math.floor(Math.random() * 3) + 7, // Simulated AI score
        aiTags: item.description ? ["Popular", "Fresh"] : ["Needs Description"]
      }));
      setMenu(enhancedData);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load menu items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // AI: Generate description
  const handleGenerateDescription = async () => {
    if (!form.name) {
      showToast("Enter an item name first", "warning");
      return;
    }
    
    setAnalyzing(true);
    try {
      // Simulated AI API call
      await new Promise(r => setTimeout(r, 1500));
      const generatedDesc = `Delicious ${form.name} made with premium ingredients. A customer favorite!`;
      setAiGeneratedDesc(generatedDesc);
      setForm(prev => ({ ...prev, description: generatedDesc }));
      showToast("Description generated by AI!", "success", true);
    } catch (err) {
      showToast("AI generation failed", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  // AI: Analyze menu
  const analyzeMenu = async () => {
    setAnalyzing(true);
    try {
      const suggestions = await analyzeMenuWithAI(menu);
      setAiSuggestions(suggestions);
      showToast("AI analysis complete! Found 3 optimization opportunities.", "success", true);
    } catch (err) {
      showToast("Analysis failed", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price || parseFloat(form.price) <= 0) e.price = "Valid price required";
    if (!form.category) e.category = "Category is required";
    if (!image) e.image = "Image is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const addMenu = async () => {
    if (!validate()) { 
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
      setAiGeneratedDesc("");
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
    avgPrice: menu.length ? (menu.reduce((a, m) => a + (m.price || 0), 0) / menu.length).toFixed(2) : "0.00",
    aiOptimized: menu.filter(m => m.aiScore >= 8).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} isAI={toast.isAI} onClose={hideToast} />}
      
      {/* AI Assistant Panel */}
      <AIAssistantPanel 
        isOpen={aiPanelOpen} 
        onClose={() => setAiPanelOpen(false)}
        onGenerateDescription={handleGenerateDescription}
        analyzing={analyzing}
      />
      
      {/* Overlay */}
      {aiPanelOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30" onClick={() => setAiPanelOpen(false)} />
      )}

      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Smart Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">Menu Manager</h1>
              <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <AIIcons.Sparkles />
                AI Powered
              </span>
            </div>
            <p className="text-gray-500">Intelligent menu management with AI optimization</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAiPanelOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/30 transition flex items-center gap-2"
            >
              <AIIcons.Robot />
              AI Assistant
            </button>
            
            <button onClick={load} disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2">
              <span className={loading ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.map((suggestion, i) => (
          <AISuggestionCard 
            key={i}
            suggestion={suggestion}
            onApply={(s) => showToast(`Applied: ${s.title}`, "success", true)}
            onDismiss={() => setAiSuggestions(prev => prev.filter((_, idx) => idx !== i))}
          />
        ))}

        {/* Smart Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Items" value={stats.total} icon="🍔" trend={12} trendUp={true} />
          <StatCard label="Categories" value={stats.categories} icon="📂" />
          <StatCard label="Average Price" value={`R${stats.avgPrice}`} icon="💰" trend={5} trendUp={false} />
          <StatCard label="AI Optimized" value={stats.aiOptimized} icon="✨" isAI={true} />
        </div>

        {/* Smart Add Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                ➕
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
                <p className="text-sm text-gray-500">Create with AI assistance</p>
              </div>
            </div>
            
            {aiGeneratedDesc && (
              <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full flex items-center gap-1">
                <AIIcons.Sparkles />
                AI Generated
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category *</label>
              <select
                className="w-full border border-gray-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                Description
                <button 
                  onClick={handleGenerateDescription}
                  disabled={analyzing || !form.name}
                  className="text-violet-600 hover:text-violet-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {analyzing ? <span className="animate-pulse">✨ Writing...</span> : <><AIIcons.Sparkles /> AI Write</>}
                </button>
              </label>
              <input
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder={aiGeneratedDesc || "Describe your item..."}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

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
          <button 
            onClick={analyzeMenu}
            disabled={analyzing}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            {analyzing ? <span className="animate-pulse">Analyzing...</span> : <><AIIcons.Brain /> Analyze with AI</>}
          </button>
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
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border-2 border-dashed border-violet-200">
            <span className="text-6xl mb-4 animate-bounce">🤖</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start with AI</h3>
            <p className="text-gray-500 text-center max-w-sm mb-6">Let our AI help you create your first menu item with optimized descriptions and pricing.</p>
            <button 
              onClick={() => setAiPanelOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center gap-2"
            >
              <AIIcons.Sparkles />
              Launch AI Assistant
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menu.map(m => (
              <MenuItemCard 
                key={m.id} 
                item={m} 
                onDelete={handleDelete} 
                deleting={deletingId === m.id}
                aiInsight={m.aiScore >= 9 ? "Top Rated" : m.aiScore <= 6 ? "Optimize" : null}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
