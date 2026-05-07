import { useEffect, useState } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import employeeService from "../services/employeeService.js";
import shiftService from "../services/shiftService.js";
import { formatDate, getDateInputValue } from "../utils/format.js";
import { getApiErrorMessage } from "../utils/http.js";

const ShiftsPage = () => {
  // ✅ MOVED INSIDE: Function is now called when component mounts
  const createEmptyForm = () => ({
    employeeId: "",
    shiftDate: getDateInputValue(),
    startTime: "09:00",
    endTime: "18:00",
    branch: "",
    status: "assigned",
  });

  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [filters, setFilters] = useState({
    employee_id: "",
    shift_date: "",
    status: "",
    branch: "",
  });
  const [form, setForm] = useState(() => createEmptyForm());

  const canManageShifts = user?.role === "admin" || user?.role === "manager";

  const loadShifts = async () => {
    setLoading(true);
    setError("");

    try {
      const query = {
        page,
        limit: 8,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query[key] = value;
        }
      });

      const requests = [shiftService.list(query)];

      if (canManageShifts) {
        requests.push(employeeService.list({ page: 1, limit: 100, status: "active" }));
      }

      const [shiftsResponse, employeesResponse] = await Promise.all(requests);
      setShifts(shiftsResponse.data.data);
      setPagination(shiftsResponse.data.pagination);

      if (employeesResponse) {
        setEmployees(employeesResponse.data.data);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load shifts."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, [page]);

  useEffect(() => {
    setPage(1);
    loadShifts();
  }, [filters.branch, filters.employee_id, filters.shift_date, filters.status]);

  const resetFormState = () => {
    setEditingShift(null);
    setForm(createEmptyForm());
    setShowForm(false);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setForm({
      employeeId: shift.employee?._id || "",
      shiftDate: getDateInputValue(shift.shiftDate),
      startTime: shift.startTime,
      endTime: shift.endTime,
      branch: shift.branch,
      status: shift.status,
    });
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleDelete = async (shift) => {
    const confirmed = window.confirm("Delete this shift assignment?");

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await shiftService.delete(shift._id);
      setSuccess("Shift deleted successfully.");
      loadShifts();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete shift."));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      employee_id: form.employeeId,
      shift_date: form.shiftDate,
      start_time: form.startTime,
      end_time: form.endTime,
      branch: form.branch,
      status: form.status,
    };

    try {
      if (editingShift) {
        await shiftService.update(editingShift._id, payload);
        setSuccess("Shift updated successfully.");
      } else {
        await shiftService.create(payload);
        setSuccess("Shift assigned successfully.");
      }

      resetFormState();
      loadShifts();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to save shift."));
    } finally {
      setSubmitting(false);
    }
  };

  const shiftGroups = shifts.reduce((accumulator, shift) => {
    const key = formatDate(shift.shiftDate);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(shift);
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          canManageShifts ? (
            <button
              className={showForm ? "secondary-button" : "primary-button"}
              onClick={() => (showForm ? resetFormState() : setShowForm(true))}
              type="button"
            >
              {showForm ? "Close Form" : "Assign Shift"}
            </button>
          ) : null
        }
        description="Track assignments, prevent overlaps, and keep shift planning easy to review."
        eyebrow="Scheduling"
        title="Shift Management"
      />

      <AlertMessage tone="error">{error}</AlertMessage>
      <AlertMessage tone="success">{success}</AlertMessage>

      {showForm ? (
        <SectionCard
          description="Create a new assignment or adjust an existing one for an active employee."
          title={editingShift ? "Update shift" : "Assign shift"}
        >
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="field-shell lg:col-span-2">
              <span className="text-sm font-medium text-slate-600">Employee</span>
              <select
                name="employeeId"
                onChange={handleFormChange}
                required
                value={form.employeeId}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} · {employee.department}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Shift date</span>
              <input
                name="shiftDate"
                onChange={handleFormChange}
                required
                type="date"
                value={form.shiftDate}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Branch</span>
              <input name="branch" onChange={handleFormChange} required type="text" value={form.branch} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Start time</span>
              <input
                name="startTime"
                onChange={handleFormChange}
                required
                type="time"
                value={form.startTime}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">End time</span>
              <input
                name="endTime"
                onChange={handleFormChange}
                required
                type="time"
                value={form.endTime}
              />
            </label>

            <label className="field-shell lg:col-span-2">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <select name="status" onChange={handleFormChange} value={form.status}>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <button className="primary-button" disabled={submitting} type="submit">
                {submitting ? "Saving..." : editingShift ? "Update shift" : "Assign shift"}
              </button>
              <button className="secondary-button" onClick={resetFormState} type="button">
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard description="Filter assignments by employee, day, status, or branch." title="Shift Register">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {canManageShifts ? (
            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Employee</span>
              <select name="employee_id" onChange={handleFilterChange} value={filters.employee_id}>
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Shift date</span>
            <input
              name="shift_date"
              onChange={handleFilterChange}
              type="date"
              value={filters.shift_date}
            />
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Status</span>
            <select name="status" onChange={handleFilterChange} value={filters.status}>
              <option value="">All</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Branch</span>
            <input
              name="branch"
              onChange={handleFilterChange}
              placeholder="Head Office"
              type="text"
              value={filters.branch}
            />
          </label>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : shifts.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Branch</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {shifts.map((shift) => (
                    <tr key={shift._id}>
                      <td className="py-4">
                        <p className="font-semibold text-slate-900">
                          {shift.employee?.name || "Unassigned employee"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {shift.employee?.designation || shift.employee?.department}
                        </p>
                      </td>
                      <td className="py-4">{formatDate(shift.shiftDate)}</td>
                      <td className="py-4">
                        {shift.startTime} - {shift.endTime}
                      </td>
                      <td className="py-4">{shift.branch}</td>
                      <td className="py-4">
                        <StatusBadge value={shift.status} />
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          {canManageShifts ? (
                            <>
                              <button
                                className="secondary-button !px-3 !py-2"
                                onClick={() => handleEdit(shift)}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="danger-button !px-3 !py-2"
                                onClick={() => handleDelete(shift)}
                                type="button"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">View only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              description="No shifts match the current filters."
              title="No shift assignments found"
            />
          )}
        </div>

        <Pagination onPageChange={setPage} pagination={pagination} />
      </SectionCard>

      <SectionCard
        description="A compact date-wise view that makes it easier to scan the current page of assignments."
        title="Calendar Snapshot"
      >
        {Object.keys(shiftGroups).length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(shiftGroups).map(([day, entries]) => (
              <div key={day} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {day}
                </p>
                <div className="mt-4 space-y-3">
                  {entries.map((entry) => (
                    <div key={entry._id} className="rounded-2xl border border-white bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{entry.employee?.name}</p>
                          <p className="text-xs text-slate-500">
                            {entry.startTime} - {entry.endTime}
                          </p>
                        </div>
                        <StatusBadge value={entry.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Shift cards will appear here once assignments are available."
            title="Nothing to show in calendar view"
          />
        )}
      </SectionCard>
    </div>
  );
};

export default ShiftsPage;
