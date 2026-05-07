const AppError = require("./AppError");

const pad = (value) => String(value).padStart(2, "0");

const getDateKeyFromParts = (year, month, day) =>
  `${year}-${pad(month)}-${pad(day)}`;

const getDateKey = (date = new Date()) =>
  getDateKeyFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());

const normalizeDateInput = (value, fieldName = "date") => {
  if (!value) {
    throw new AppError(`${fieldName} is required.`, 400);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      date: new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())),
      key: getDateKeyFromParts(
        value.getUTCFullYear(),
        value.getUTCMonth() + 1,
        value.getUTCDate()
      ),
    };
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.split("-").map(Number);

    return {
      date: new Date(Date.UTC(year, month - 1, day)),
      key: value,
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`Invalid ${fieldName}. Use YYYY-MM-DD format.`, 400);
  }

  return {
    date: new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())),
    key: getDateKeyFromParts(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth() + 1,
      parsed.getUTCDate()
    ),
  };
};

const parseTimeToMinutes = (value, fieldName) => {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value.trim())) {
    throw new AppError(`Invalid ${fieldName}. Use HH:MM 24-hour format.`, 400);
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (hours > 23 || minutes > 59) {
    throw new AppError(`Invalid ${fieldName}. Use HH:MM 24-hour format.`, 400);
  }

  return hours * 60 + minutes;
};

const getShiftWindow = (startTime, endTime) => {
  const startMinutes = parseTimeToMinutes(startTime, "start_time");
  const endMinutes = parseTimeToMinutes(endTime, "end_time");

  if (endMinutes <= startMinutes) {
    throw new AppError("Shift end time must be after start time.", 400);
  }

  return {
    startMinutes,
    endMinutes,
  };
};

const calculateWorkingMinutes = (checkInAt, checkOutAt) => {
  const diff = new Date(checkOutAt).getTime() - new Date(checkInAt).getTime();

  if (diff < 0) {
    throw new AppError("Checkout cannot be before check-in.", 400);
  }

  return Math.round(diff / 60000);
};

const minutesToHours = (minutes) => Number((minutes / 60).toFixed(2));

module.exports = {
  calculateWorkingMinutes,
  getDateKey,
  getShiftWindow,
  minutesToHours,
  normalizeDateInput,
  parseTimeToMinutes,
};
