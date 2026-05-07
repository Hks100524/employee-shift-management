import api from "./api.js";

const leaveService = {
  getLeaves: (params = {}) => {
    return api.get("/leaves", { params });
  },

  applyLeave: (payload) => {
    return api.post("/leaves", payload);
  },

  approveLeave: (id) => {
    return api.put(`/leaves/${id}/approve`);
  },

  rejectLeave: (id) => {
    return api.put(`/leaves/${id}/reject`);
  },
};

export default leaveService;