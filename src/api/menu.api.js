import { api } from "./auth.api";

// ── Core Menu Operations ──
export const getMenu = () => api.get("/menu");

export const getMenuItem = (id) => api.get(`/menu/${id}`);

export const createMenu = ({ name, price, category, description, file }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", String(price));
  formData.append("category", category);
  if (description) formData.append("description", description);
  if (file) formData.append("file", file);

  // FIX: Do NOT manually set Content-Type to "multipart/form-data".
  // Axios must auto-generate the header INCLUDING the boundary token:
  //   Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ
  // If you set it manually, the boundary is missing and the server
  // cannot parse any of the form fields — causing a 422 Unprocessable Entity.
  return api.post("/menu", formData);
};

export const deleteMenu = (id) => api.delete(`/menu/${id}`);

// ── AI-Powered Features ──

/**
 * Analyze entire menu with AI for optimization suggestions
 * Returns: Array of suggestion objects with title, description, confidence, action
 */
export const analyzeMenuWithAI = async (menuItems) => {
  // Simulated AI analysis - replace with actual API endpoint when ready
  // return api.post("/ai/analyze-menu", { items: menuItems });
  
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            title: "Add Combo Deals",
            description: "Your top 3 items would sell 23% better as a combo. Consider creating a 'Kota + Drink' bundle.",
            confidence: 87,
            action: "create_combo"
          },
          {
            title: "Price Adjustment",
            description: "Side dishes are priced 15% below market average. Consider increasing by R2-3.",
            confidence: 92,
            action: "adjust_pricing"
          },
          {
            title: "Missing Descriptions",
            description: "4 items lack descriptions. AI-generated descriptions could improve engagement by 34%.",
            confidence: 78,
            action: "generate_descriptions"
          }
        ]
      });
    }, 1500);
  });
};

/**
 * Generate AI description for a menu item
 * @param {Object} params - Item details
 * @param {string} params.name - Item name
 * @param {string} params.category - Item category
 * @param {number} params.price - Item price
 * @returns {Promise<{description: string, tags: string[], score: number}>}
 */
export const generateAIDescription = async ({ name, category, price }) => {
  // Replace with actual AI endpoint
  // return api.post("/ai/generate-description", { name, category, price });
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const descriptions = {
        kota: `Premium ${name} stacked with fresh ingredients. Our signature kota features fluffy bread, crispy fries, and your choice of protein. A local favorite!`,
        drink: `Refreshing ${name} served ice-cold. Perfect companion to any meal. Made with quality ingredients for that authentic taste.`,
        side: `Crispy, golden ${name} - the perfect addition to your meal. Freshly prepared daily for maximum flavor.`,
        combo: `Ultimate value meal: ${name}. Everything you love in one delicious package. Best-seller for a reason!`,
        other: `Delicious ${name} made with premium ingredients. Crafted with care for an unforgettable taste experience.`
      };
      
      resolve({
        data: {
          description: descriptions[category] || descriptions.other,
          tags: ["Popular", "Fresh", category === "combo" ? "Best Value" : "Tasty"],
          score: Math.floor(Math.random() * 2) + 8 // 8-10 AI score
        }
      });
    }, 1200);
  });
};

/**
 * Get AI optimization score for a specific menu item
 * @param {string} id - Menu item ID
 * @returns {Promise<{score: number, insights: string[], recommendations: string[]}>}
 */
export const getAIOptimizationScore = (id) => {
  // return api.get(`/ai/score/${id}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          score: Math.floor(Math.random() * 4) + 6, // 6-10
          insights: [
            "Good image quality",
            "Price is competitive",
            "Description could be more enticing"
          ],
          recommendations: [
            "Add more detailed description",
            "Consider slight price increase",
            "Highlight as 'Chef's Choice'"
          ]
        }
      });
    }, 800);
  });
};

/**
 * Batch optimize multiple menu items with AI
 * @param {string[]} itemIds - Array of menu item IDs to optimize
 * @returns {Promise<{optimized: number, items: Array}>}
 */
export const batchAIOptimize = (itemIds) => {
  // return api.post("/ai/batch-optimize", { itemIds });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          optimized: itemIds.length,
          items: itemIds.map(id => ({
            id,
            aiScore: Math.floor(Math.random() * 2) + 8,
            improved: true
          }))
        }
      });
    }, 2000);
  });
};

/**
 * Get AI-powered pricing recommendation
 * @param {Object} params
 * @param {string} params.category - Item category
 * @param {number} params.currentPrice - Current price
 * @param {string} params.name - Item name
 * @returns {Promise<{recommendedPrice: number, confidence: number, reasoning: string}>}
 */
export const getAIPricingRecommendation = ({ category, currentPrice, name }) => {
  // return api.post("/ai/pricing", { category, currentPrice, name });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const adjustment = (Math.random() * 4 - 2).toFixed(2); // -2 to +2
      const recommended = Math.max(5, parseFloat(currentPrice) + parseFloat(adjustment));
      
      resolve({
        data: {
          recommendedPrice: recommended,
          confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
          reasoning: `Based on market analysis of ${category} items, ${adjustment > 0 ? 'a slight increase' : 'maintaining current price'} optimizes for both sales volume and margin.`
        }
      });
    }, 1000);
  });
};

/**
 * Get trending items prediction from AI
 * @returns {Promise<{trending: Array, forecast: string}>}
 */
export const getAITrendingForecast = () => {
  // return api.get("/ai/trending");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          trending: ["combo", "kota", "side"],
          forecast: "Combos expected to rise 15% this week based on historical patterns"
        }
      });
    }, 900);
  });
};
