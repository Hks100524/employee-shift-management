import api from "./api.js";

const shiftService = {
  create: (payload) => api.post("/shifts", payload),
  delete: (id) => api.delete(`/shifts/${id}`),
  list: (params) => api.get("/shifts", { params }),
  update: (id, payload) => api.put(`/shifts/${id}`, payload),
};

export default shiftService;
