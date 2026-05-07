import api from "./api.js";

const authService = {
  getMe: () => api.get("/auth/me"),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  register: (payload) => api.post("/auth/register", payload),
};

export default authService;
