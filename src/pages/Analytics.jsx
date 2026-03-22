import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getAnalyticsDashboard } from "../api/analytics.api";
import { RefreshCw, MessageCircle, Zap, Lightbulb, Smile, AlertCircle } from "lucide-react";

const RANGES = [
  { value: "7d",  label: "7 days"   },
  { value: "30d", label: "30 days"  },
  { value: "all", label: "All time" },
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#13131a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#e2e8f0",
    fontSize: 12,
  },
};

function StatCard({ label, value, change, icon: Icon, color }) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
      <div className={`inline-flex p-2.5 rounded-xl mb-4 ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      {change !== undefined && (
        <span className={`text-xs font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
          {positive ? "↑" : "↓"} {Math.abs(change)}% from last period
        </span>
      )}
    </div>
  );
}

function SentimentBadge({ sentiment }) {
  const cfg = {
    positive: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    neutral:  "bg-amber-500/15  text-amber-400  border-amber-500/20",
    negative: "bg-rose-500/15   text-rose-400   border-rose-500/20",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border capitalize ${cfg[sentiment] || cfg.neutral}`}>
      {sentiment}
    </span>
  );
}

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [range, setRange]   = useState("7d");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsDashboard(range);
      setData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Failed to load analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]); // eslint-disable-line

  const stats = data?.stats;
  const trends = data?.chat_trends || [];
  const topItems = data?.top_menu_items || [];
  const sentiment = data?.sentiment_data || [];
  const suggestions = data?.recent_suggestions || [];

  const PIE_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">KotaBot engagement & menu insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  range === r.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Chats"         value={stats.total_chats?.toLocaleString()}   change={stats.chat_change}          icon={MessageCircle} color="bg-gradient-to-br from-indigo-500 to-blue-600"   />
          <StatCard label="Avg Response Time"   value={`${stats.avg_response_time}ms`}         change={stats.response_time_change} icon={Zap}           color="bg-gradient-to-br from-amber-500 to-orange-600"  />
          <StatCard label="Suggestions"         value={stats.total_suggestions?.toLocaleString()} change={stats.suggestions_change} icon={Lightbulb}   color="bg-gradient-to-br from-emerald-500 to-teal-600"  />
          <StatCard label="Satisfaction"        value={`${stats.satisfaction}%`}                change={stats.satisfaction_change} icon={Smile}         color="bg-gradient-to-br from-violet-500 to-purple-600" />
        </div>
      )}

      {/* Charts Row 1 */}
      {!loading && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat trend */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Chat Volume</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="chats"          stroke="#6366f1" strokeWidth={2} dot={false} name="Chats" />
                <Line type="monotone" dataKey="orders_tracked" stroke="#10b981" strokeWidth={2} dot={false} name="Orders tracked" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment pie */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Sentiment</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sentiment} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sentiment.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={v => `${Number(v).toFixed(0)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      {!loading && topItems.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Top Menu Items Mentioned</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topItems} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 11 }} width={130} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="mentions" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Suggestions</h3>
          <div className="divide-y divide-white/5">
            {suggestions.map((s, i) => (
              <div key={i} className="py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{s.user}</span>
                    <SentimentBadge sentiment={s.sentiment} />
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{s.message}</p>
                </div>
                <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="text-center py-16 text-slate-500">No analytics data available yet.</div>
      )}
    </div>
  );
}
