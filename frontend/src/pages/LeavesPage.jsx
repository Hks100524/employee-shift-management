import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

import { useAuth } from "../context/AuthContext";
import employeeService from "../services/employeeService.js";
import leaveService from "../services/leaveService.js";
import { getApiErrorMessage } from "../utils/http.js";
import { formatDate, getDateInputValue, getMonthStartInputValue } from "../utils/format.js";

const LeavesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState(() => ({
    search: "",
    status: "",
    leave_type: "",
    employee_id: "",
    start_date: getMonthStartInputValue(),
    end_date: getDateInputValue(),
  }));
  const searchTimeoutRef = useRef(null);

  const canManageLeaves = user?.role === "admin" || user?.role === "manager";

  const loadLeaves = async () => {
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

      const requests = [leaveService.getLeaves(query)];

      if (canManageLeaves) {
        requests.push(employeeService.list({ page: 1, limit: 100, status: "active" }));
      }

      const [leavesResponse, employeesResponse] = await Promise.all(requests);
      setLeaves(leavesResponse.data.data);
      setPagination(leavesResponse.data.pagination);

      if (employeesResponse) {
        setEmployees(employeesResponse.data.data);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load leaves."));
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (canManageLeaves) {
      setEmployeesLoading(true);
    }
    await loadLeaves();
    if (canManageLeaves) {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  useEffect(() => {
    setPage(1);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      loadData();
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [JSON.stringify(filters)]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      leave_type: "",
      employee_id: "",
      start_date: getMonthStartInputValue(),
      end_date: getDateInputValue(),
    });
  };

  const handleApprove = async (id) => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await leaveService.approveLeave(id);
      setSuccess("Leave approved successfully");
      loadLeaves();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to approve leave."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await leaveService.rejectLeave(id);
      setSuccess("Leave rejected successfully");
      loadLeaves();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to reject leave."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Submit leave requests and review approval outcomes with advanced search & filters."
        eyebrow="Leave"
        actions={
          user?.role?.toLowerCase() === "employee" && (
            <button
              className="primary-button"
              onClick={() => navigate("/apply-leave")}
              type="button"
            >
              Apply Leave
            </button>
          )
        }
      />

      <AlertMessage tone="error">{error}</AlertMessage>
      <AlertMessage tone="success">{success}</AlertMessage>

      <SectionCard
        title="Leave Requests"
        description="Smart search, status/date/employee filters, debounced input, pagination. Professional UX."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Search</span>
            <input
              name="search"
              onChange={handleFilterChange}
              placeholder="Employee name, reason..."
              type="text"
              value={filters.search}
            />
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Status</span>
            <select name="status" onChange={handleFilterChange} value={filters.status}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Leave Type</span>
            <select name="leave_type" onChange={handleFilterChange} value={filters.leave_type}>
              <option value="">All</option>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="annual">Annual</option>
              <option value="unpaid">Unpaid</option>
              <option value="other">Other</option>
            </select>
          </label>

          {canManageLeaves && (
            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Employee</span>
              <select name="employee_id" onChange={handleFilterChange} value={filters.employee_id}>
                <option value="">All</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.department})
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Start Date</span>
            <input
              name="start_date"
              onChange={handleFilterChange}
              type="date"
              value={filters.start_date}
            />
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">End Date</span>
            <input
              name="end_date"
              onChange={handleFilterChange}
              type="date"
              value={filters.end_date}
            />
          </label>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            className="secondary-button"
            onClick={clearFilters}
            type="button"
          >
            Clear All Filters
          </button>
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : leaves.length ? (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-3 pr-6 text-left font-medium">Employee</th>
                  <th className="py-3 px-3 text-left font-medium">Type</th>
                  <th className="py-3 px-3 text-left font-medium">Dates</th>
                  <th className="py-3 px-3 text-left font-medium">Reason</th>
                  <th className="py-3 px-3 text-left font-medium">Status</th>
                  <th className="py-3 pl-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50">
                    <td className="py-4 pr-6 font-medium">
                      {leave.employee?.name || "Unassigned"}
                      {leave.employee?.department && (
                        <p className="text-xs text-slate-500">{leave.employee.department}</p>
                      )}
                    </td>
                    <td className="py-4 px-3 capitalize">{leave.leaveType}</td>
                    <td className="py-4 px-3">
                      <div>{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</div>
                      <div className="text-xs text-slate-500">{leave.totalDays} days</div>
                    </td>
                    <td className="py-4 px-3 max-w-xs">
                      <div className="line-clamp-2">{leave.reason}</div>
                    </td>
                    <td className="py-4 px-3">
                      <StatusBadge value={leave.status} />
                    </td>
                    <td className="py-4 pl-6">
                      {canManageLeaves && leave.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            className="secondary-button !px-3 !py-1.5 text-xs"
                            disabled={submitting}
                            onClick={() => handleApprove(leave._id)}
                            type="button"
                          >
                            {submitting ? "Approving..." : "Approve"}
                          </button>
                          <button
                            className="danger-button !px-3 !py-1.5 text-xs"
                            disabled={submitting}
                            onClick={() => handleReject(leave._id)}
                            type="button"
                          >
                            {submitting ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching leave requests"
            description="Adjust your filters or there may be no leaves for the selected criteria."
          />
        )}

        {pagination && (
          <Pagination onPageChange={setPage} pagination={pagination} />
        )}
      </SectionCard>
    </div>
  );
};

export default LeavesPage;
