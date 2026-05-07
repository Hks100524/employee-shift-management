import axios from "axios";

// 👉 backend base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REGISTER =================
const register = async (payload) => {
  const { joiningDate, ...rest } = payload;

  const response = await API.post("/auth/register", {
    ...rest,
    joining_date: joiningDate,
  });

  return response;
};

// ================= LOGIN =================
const login = async (payload) => {
  return API.post("/auth/login", payload);
};

// ================= GET ME =================
const getMe = async () => {
  const token = localStorage.getItem("ems_token");

  return API.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= LOGOUT =================
const logout = async () => {
  const token = localStorage.getItem("ems_token");

  return API.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export default {
  register,
  login,
  getMe,
  logout,
};