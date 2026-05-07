import api from "./api.js";

const attendanceService = {
  checkIn: (idempotencyKey) =>
    api.post(
      "/attendance/checkin",
      {},
      {
        headers: { "Idempotency-Key": idempotencyKey },
      }
    ),
  checkOut: (idempotencyKey) =>
    api.post(
      "/attendance/checkout",
      {},
      {
        headers: { "Idempotency-Key": idempotencyKey },
      }
    ),
  me: (params) => api.get("/attendance/me", { params }),
};

export default attendanceService;
