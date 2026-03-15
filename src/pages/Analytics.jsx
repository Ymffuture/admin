import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, all

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        setData(mockData); // Fallback to demo data
      }
    } catch (error) {
      console.error("Analytics fetch failed:", error);
      setData(mockData); // Use demo data on error
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || mockData.stats;
  const chatTrends = data?.chatTrends || mockData.chatTrends;
  const topMenuItems = data?.topMenuItems || mockData.topMenuItems;
  const sentimentData = data?.sentimentData || mockData.sentimentData;
  const recentSuggestions = data?.recentSuggestions || mockData.recentSuggestions;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>KotaBot Analytics</h1>
        <div style={styles.controls}>
          {["7d", "30d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                ...styles.button,
                ...(timeRange === range ? styles.buttonActive : {}),
              }}
            >
              {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        <MetricCard
          label="Total Chats"
          value={stats.totalChats}
          change={stats.chatChange}
          icon="💬"
          color="#DD5A3A"
        />
        <MetricCard
          label="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          change={stats.responseTimeChange}
          icon="⚡"
          color="#1B5E7F"
          inverted
        />
        <MetricCard
          label="Suggestions Received"
          value={stats.totalSuggestions}
          change={stats.suggestionsChange}
          icon="💡"
          color="#C69D47"
        />
        <MetricCard
          label="User Satisfaction"
          value={`${stats.satisfaction}%`}
          change={stats.satisfactionChange}
          icon="😊"
          color="#2C8B5E"
        />
      </div>

      {/* Charts Row 1 */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Chat Volume Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chatTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD8" />
              <XAxis dataKey="date" stroke="#888780" />
              <YAxis stroke="#888780" />
              <Tooltip
                contentStyle={{
                  background: "#F5F4F1",
                  border: "0.5px solid #B4B2A9",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="chats"
                stroke="#DD5A3A"
                strokeWidth={2}
                dot={{ fill: "#DD5A3A", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="orders_tracked"
                stroke="#1B5E7F"
                strokeWidth={2}
                dot={{ fill: "#1B5E7F", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Sentiment Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Top Menu Items Mentioned</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={topMenuItems}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD8" />
              <XAxis type="number" stroke="#888780" />
              <YAxis dataKey="name" type="category" stroke="#888780" width={140} />
              <Tooltip
                contentStyle={{
                  background: "#F5F4F1",
                  border: "0.5px solid #B4B2A9",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="mentions" fill="#C69D47" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Suggestions by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topMenuItems.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD8" />
              <XAxis dataKey="name" stroke="#888780" />
              <YAxis stroke="#888780" />
              <Tooltip
                contentStyle={{
                  background: "#F5F4F1",
                  border: "0.5px solid #B4B2A9",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="mentions" fill="#2C8B5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Suggestions */}
      <div style={styles.suggestionsCard}>
        <h3 style={styles.chartTitle}>Recent User Suggestions</h3>
        <div style={styles.suggestionsList}>
          {recentSuggestions.map((suggestion, idx) => (
            <div key={idx} style={styles.suggestionItem}>
              <div style={styles.suggestionHeader}>
                <span style={styles.suggestionUser}>{suggestion.user}</span>
                <span
                  style={{
                    ...styles.sentimentBadge,
                    ...styles[`sentiment_${suggestion.sentiment}`],
                  }}
                >
                  {suggestion.sentiment}
                </span>
              </div>
              <p style={styles.suggestionText}>{suggestion.message}</p>
              <span style={styles.suggestionTime}>{suggestion.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, icon, color, inverted }) {
  const isPositive = (inverted ? change < 0 : change > 0);
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricIcon}>{icon}</div>
      <div style={styles.metricContent}>
        <span style={styles.metricLabel}>{label}</span>
        <span style={{ ...styles.metricValue, color }}>{value}</span>
        <span
          style={{
            ...styles.metricChange,
            color: isPositive ? "#2C8B5E" : "#A32D2D",
          }}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(change)}% from last period
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────

const mockData = {
  stats: {
    totalChats: 2847,
    chatChange: 12,
    avgResponseTime: 340,
    responseTimeChange: -5,
    totalSuggestions: 156,
    suggestionsChange: 8,
    satisfaction: 89,
    satisfactionChange: 3,
  },
  chatTrends: [
    { date: "Mon", chats: 380, orders_tracked: 220 },
    { date: "Tue", chats: 410, orders_tracked: 245 },
    { date: "Wed", chats: 395, orders_tracked: 210 },
    { date: "Thu", chats: 450, orders_tracked: 290 },
    { date: "Fri", chats: 520, orders_tracked: 340 },
    { date: "Sat", chats: 600, orders_tracked: 410 },
    { date: "Sun", chats: 480, orders_tracked: 320 },
  ],
  topMenuItems: [
    { name: "Kota Special", mentions: 420 },
    { name: "Mogodu & Tripe", mentions: 380 },
    { name: "Beef Burger", mentions: 310 },
    { name: "Chicken Fillet", mentions: 275 },
    { name: "Polony Kota", mentions: 245 },
  ],
  sentimentData: [
    { name: "Positive", value: 68, color: "#2C8B5E" },
    { name: "Neutral", value: 24, color: "#C69D47" },
    { name: "Negative", value: 8, color: "#A32D2D" },
  ],
  recentSuggestions: [
    {
      user: "Lindiwe M.",
      sentiment: "positive",
      message: "Would love if KotaBot could recommend combos based on my order history!",
      time: "2 hours ago",
    },
    {
      user: "Thabo K.",
      sentiment: "positive",
      message: "The kota tracking feature is lekker! Makes waiting so much easier.",
      time: "4 hours ago",
    },
    {
      user: "Nomsa T.",
      sentiment: "neutral",
      message: "Sometimes the response takes a while during peak hours",
      time: "6 hours ago",
    },
    {
      user: "Sipho D.",
      sentiment: "positive",
      message: "Great customer service through the bot. Very helpful ayt!",
      time: "8 hours ago",
    },
    {
      user: "Amara J.",
      sentiment: "neutral",
      message: "Feature request: add calorie info to menu items?",
      time: "12 hours ago",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────

const styles = {
  container: {
    padding: "32px 24px",
    background: "#FAF9F7",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 600,
    margin: 0,
    color: "#2C2C2A",
  },
  controls: {
    display: "flex",
    gap: "8px",
  },
  button: {
    padding: "8px 16px",
    border: "0.5px solid #B4B2A9",
    background: "#FFFFFF",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "#5F5E5A",
    transition: "all 0.2s ease",
  },
  buttonActive: {
    background: "#DD5A3A",
    color: "#FFFFFF",
    border: "0.5px solid #DD5A3A",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  metricCard: {
    display: "flex",
    gap: "16px",
    padding: "20px",
    background: "#FFFFFF",
    border: "0.5px solid #D3D1C7",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  metricIcon: {
    fontSize: "32px",
    lineHeight: "1",
  },
  metricContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  metricLabel: {
    fontSize: "12px",
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#2C2C2A",
  },
  metricChange: {
    fontSize: "12px",
    fontWeight: 500,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  chartCard: {
    padding: "24px",
    background: "#FFFFFF",
    border: "0.5px solid #D3D1C7",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  chartTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: 600,
    color: "#2C2C2A",
  },
  suggestionsCard: {
    padding: "24px",
    background: "#FFFFFF",
    border: "0.5px solid #D3D1C7",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  suggestionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  suggestionItem: {
    paddingBottom: "16px",
    borderBottom: "0.5px solid #E0DDD8",
  },
  suggestionItem_last: {
    borderBottom: "none",
  },
  suggestionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  suggestionUser: {
    fontWeight: 600,
    color: "#2C2C2A",
    fontSize: "14px",
  },
  sentimentBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "4px",
    textTransform: "capitalize",
  },
  sentiment_positive: {
    background: "#EAF3DE",
    color: "#27500A",
  },
  sentiment_neutral: {
    background: "#FAEEDA",
    color: "#633806",
  },
  sentiment_negative: {
    background: "#FCEBEB",
    color: "#791F1F",
  },
  suggestionText: {
    margin: "8px 0",
    fontSize: "14px",
    color: "#5F5E5A",
    lineHeight: "1.5",
  },
  suggestionTime: {
    fontSize: "12px",
    color: "#B4B2A9",
  },
  loadingSpinner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "2px solid #E0DDD8",
    borderTop: "2px solid #DD5A3A",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// CSS for animation
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
