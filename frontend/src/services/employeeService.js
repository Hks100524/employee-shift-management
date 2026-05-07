import api from "./api.js";

const employeeService = {
  create: (payload) => api.post("/employees", payload),
  delete: (id) => api.delete(`/employees/${id}`),
  list: (params) => api.get("/employees", { params }),
  update: (id, payload) => api.put(`/employees/${id}`, payload),
};

export default employeeService;
