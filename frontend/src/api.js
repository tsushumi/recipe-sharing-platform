const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRecipes: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/api/recipes${query ? `?${query}` : ""}`);
  },
  getRecipe: (id) => request(`/api/recipes/${id}`),
  getCategories: () => request(`/api/categories`),
  getStats: () => request(`/api/stats`),
  rateRecipe: (id, userId, value) =>
    request(`/api/recipes/${id}/ratings`, {
      method: "POST",
      body: JSON.stringify({ userId, value }),
    }),
};

export default api;
