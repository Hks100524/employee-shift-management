import { useEffect, useState, useRef } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import attendanceService from "../services/attendanceService.js";
import { formatDate, formatDateTime, formatHours, getDateInputValue, getMonthStartInputValue } from "../utils/format.js";
import { createRequestKey, getApiErrorMessage } from "../utils/http.js";

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ totalDays: 0, totalWorkingHours: 0, totalWorkingMinutes: 0 });
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const searchTimeoutRef = useRef(null);
  const [filters, setFilters] = useState(() => ({
    search: "",
    start_date: getMonthStartInputValue(),
    end_date: getDateInputValue(),
  }));

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await attendanceService.me({
        page,
        limit: 8,
        ...filters,
      });

      setAttendance(response.data.data);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load attendance history."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [page]);

  useEffect(() => {
    setPage(1);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => loadAttendance(), 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const runAttendanceAction = async (type) => {
    setActionLoading(type);
    setError("");
    setSuccess("");

    try {
      const requestKey = createRequestKey(type);
      const response =
        type === "checkin"
          ? await attendanceService.checkIn(requestKey)
          : await attendanceService.checkOut(requestKey);

      setSuccess(response.data.message);
      loadAttendance();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update attendance."));
    } finally {
      setActionLoading("");
    }
  };

  const todayKey = getDateInputValue();
  const todayEntry = attendance.find((item) => item.attendanceDateKey === todayKey);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <button
              className="primary-button"
              disabled={Boolean(actionLoading)}
              onClick={() => runAttendanceAction("checkin")}
              type="button"
            >
              {actionLoading === "checkin" ? "Checking in..." : "Check In"}
            </button>
            <button
              className="secondary-button"
              disabled={Boolean(actionLoading)}
              onClick={() => runAttendanceAction("checkout")}
              type="button"
            >
              {actionLoading === "checkout" ? "Checking out..." : "Check Out"}
            </button>
          </>
        }
        description="Record attendance safely and review working-hour history for the selected date range."
        eyebrow="Attendance"
        title="Attendance Module"
      />

      <AlertMessage tone="error">{error}</AlertMessage>
      <AlertMessage tone="success">{success}</AlertMessage>

      <div className="grid gap-4 xl:grid-cols-3">
        <StatCard
          accent="teal"
          caption="Filtered attendance days"
          label="Total Days"
          value={summary.totalDays}
        />
        <StatCard
          accent="amber"
          caption="Auto-calculated from check-in and check-out"
          label="Working Hours"
          value={`${summary.totalWorkingHours.toFixed(2)} hrs`}
        />
        <StatCard
          accent="rose"
          caption={todayEntry?.checkInAt ? "Today's attendance already started" : "No attendance entry yet"}
          label="Today's Status"
          value={todayEntry?.status ? todayEntry.status.toUpperCase() : "PENDING"}
        />
      </div>

      <SectionCard description="Filter your records by date to review any period in detail." title="History Filters">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Search</span>
            <input
              name="search"
              onChange={handleFilterChange}
              placeholder="Search attendance..."
              type="text"
              value={filters.search}
            />
          </label>
          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Start date</span>
            <input
              name="start_date"
              onChange={handleFilterChange}
              type="date"
              value={filters.start_date}
            />
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">End date</span>
            <input name="end_date" onChange={handleFilterChange} type="date" value={filters.end_date} />
          </label>
        </div>
        <div className="mt-4">
          <button className="secondary-button" onClick={() => setFilters({ search: "", start_date: getMonthStartInputValue(), end_date: getDateInputValue() })} type="button">
            Clear Filters
          </button>
        </div>
      </SectionCard>

      <SectionCard description="Review the latest attendance entries, shift linkage, and working hours." title="Attendance History">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : attendance.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Shift</th>
                  <th className="pb-3 font-medium">Check In</th>
                  <th className="pb-3 font-medium">Check Out</th>
                  <th className="pb-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {attendance.map((entry) => (
                  <tr key={entry._id}>
                    <td className="py-4">{formatDate(entry.attendanceDate)}</td>
                    <td className="py-4">
                      {entry.shift ? (
                        <>
                          <p className="font-medium text-slate-900">
                            {entry.shift.startTime} - {entry.shift.endTime}
                          </p>
                          <p className="text-xs text-slate-500">{entry.shift.branch}</p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">No linked shift</span>
                      )}
                    </td>
                    <td className="py-4">{formatDateTime(entry.checkInAt)}</td>
                    <td className="py-4">{formatDateTime(entry.checkOutAt)}</td>
                    <td className="py-4">{formatHours(entry.workingMinutes)}</td>
                    <td className="py-4">
                      <StatusBadge value={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            description="Attendance entries will appear after your first check-in."
            title="No attendance history found"
          />
        )}

        <Pagination onPageChange={setPage} pagination={pagination} />
      </SectionCard>
    </div>
  );
};

export default AttendancePage;
