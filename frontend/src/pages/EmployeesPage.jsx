import { useEffect, useState } from "react";

import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import employeeService from "../services/employeeService.js";
import { formatDate, getDateInputValue, titleCase } from "../utils/format.js";
import { getApiErrorMessage } from "../utils/http.js";

const EmployeesPage = () => {
  // ✅ MOVED INSIDE: Function is now called when component mounts
  const createEmptyForm = () => ({
    name: "",
    email: "",
    department: "",
    branch: "",
    designation: "",
    joiningDate: getDateInputValue(),
    status: "active",
    managerId: "",
    role: "employee",
    createLoginAccount: true,
    password: "",
  });

  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    branch: "",
  });
  const [form, setForm] = useState(() => createEmptyForm());

  const loadEmployees = async () => {
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

      const requests = [employeeService.list(query)];

      if (user?.role === "admin") {
        requests.push(employeeService.list({ page: 1, limit: 100 }));
      }

      const [employeesResponse, managerResponse] = await Promise.all(requests);
      setEmployees(employeesResponse.data.data);
      setPagination(employeesResponse.data.pagination);

      if (managerResponse) {
        const managerRecords = managerResponse.data.data.filter((item) =>
          ["admin", "manager"].includes(item.user?.role)
        );
        setManagers(managerRecords);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load employees."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, filters.branch, filters.department, filters.search, filters.status]);

  const resetFormState = () => {
    setForm(createEmptyForm());
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      branch: employee.branch,
      designation: employee.designation,
      joiningDate: getDateInputValue(employee.joiningDate),
      status: employee.status,
      managerId: employee.manager?._id || "",
      role: employee.user?.role || "employee",
      createLoginAccount: Boolean(employee.user),
      password: "",
    });
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(`Delete ${employee.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await employeeService.delete(employee._id);
      setSuccess("Employee deleted successfully.");
      loadEmployees();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete employee."));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      email: form.email,
      department: form.department,
      branch: form.branch,
      designation: form.designation,
      joiningDate: form.joiningDate,
      status: form.status,
      role: form.role,
      managerId: form.managerId || undefined,
      createLoginAccount: form.createLoginAccount,
    };

    if (form.password) {
      payload.password = form.password;
    }

    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee._id, payload);
        setSuccess("Employee updated successfully.");
      } else {
        await employeeService.create(payload);
        setSuccess("Employee created successfully.");
      }

      resetFormState();
      loadEmployees();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to save employee."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <button
            className={showForm ? "secondary-button" : "primary-button"}
            onClick={() => (showForm ? resetFormState() : setShowForm(true))}
            type="button"
          >
            {showForm ? "Close Form" : "Add Employee"}
          </button>
        }
        description="Create and manage employee records with role-aware access controls."
        eyebrow="Employees"
        title="Employee Management"
      />

      <AlertMessage tone="error">{error}</AlertMessage>
      <AlertMessage tone="success">{success}</AlertMessage>

      {showForm ? (
        <SectionCard
          description="Capture profile details, reporting manager, and optional login access in one place."
          title={editingEmployee ? "Update employee" : "Create employee"}
        >
<form className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Name</span>
              <input name="name" onChange={handleFormChange} required type="text" value={form.name} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Email</span>
              <input name="email" onChange={handleFormChange} required type="email" value={form.email} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Department</span>
              <input
                name="department"
                onChange={handleFormChange}
                required
                type="text"
                value={form.department}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Branch</span>
              <input name="branch" onChange={handleFormChange} required type="text" value={form.branch} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Designation</span>
              <input
                name="designation"
                onChange={handleFormChange}
                required
                type="text"
                value={form.designation}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Joining date</span>
              <input
                name="joiningDate"
                onChange={handleFormChange}
                required
                type="date"
                value={form.joiningDate}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <select name="status" onChange={handleFormChange} value={form.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            {user?.role === "admin" ? (
              <label className="field-shell">
                <span className="text-sm font-medium text-slate-600">Role</span>
                <select name="role" onChange={handleFormChange} value={form.role}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            ) : null}

            {user?.role === "admin" ? (
              <label className="field-shell lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">Reporting manager</span>
                <select name="managerId" onChange={handleFormChange} value={form.managerId}>
                  <option value="">No manager assigned</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({titleCase(manager.user?.role || "manager")})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:col-span-2">
              <input
                checked={form.createLoginAccount || Boolean(editingEmployee?.user)}
                disabled={Boolean(editingEmployee?.user)}
                name="createLoginAccount"
                onChange={handleFormChange}
                type="checkbox"
              />
              {editingEmployee?.user
                ? "Login account already exists for this employee."
                : "Create login account for this employee."}
            </label>

            {form.createLoginAccount || editingEmployee?.user ? (
              <label className="field-shell lg:col-span-2">
                <span className="text-sm font-medium text-slate-600">
                  {editingEmployee ? "New password (optional)" : "Password"}
                </span>
                <input
                  minLength={6}
                  name="password"
                  onChange={handleFormChange}
                  required={!editingEmployee}
                  type="password"
                  value={form.password}
                />
              </label>
            ) : null}

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <button className="primary-button" disabled={submitting} type="submit">
                {submitting ? "Saving..." : editingEmployee ? "Update employee" : "Create employee"}
              </button>
              <button className="secondary-button" onClick={resetFormState} type="button">
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard
        description="Search by person or narrow the list by status, branch, and department."
        title="Employee Directory"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Search</span>
            <input
              name="search"
              onChange={handleFilterChange}
              placeholder="Name, email, branch..."
              type="text"
              value={filters.search}
            />
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Status</span>
            <select name="status" onChange={handleFilterChange} value={filters.status}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="field-shell">
            <span className="text-sm font-medium text-slate-600">Department</span>
            <input
              name="department"
              onChange={handleFilterChange}
              placeholder="Operations"
              type="text"
              value={filters.department}
            />
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
          ) : employees.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium">Designation</th>
                    <th className="pb-3 font-medium">Joining</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Login Role</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td className="py-4">
                        <p className="font-semibold text-slate-900">{employee.name}</p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                        <p className="text-xs text-slate-400">{employee.branch}</p>
                      </td>
                      <td className="py-4">{employee.department}</td>
                      <td className="py-4">
                        {employee.designation}
                        {employee.manager?.name ? (
                          <p className="mt-1 text-xs text-slate-400">
                            Reports to {employee.manager.name}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-4">{formatDate(employee.joiningDate)}</td>
                      <td className="py-4">
                        <StatusBadge value={employee.status} />
                      </td>
                      <td className="py-4">
                        {employee.user?.role ? (
                          <StatusBadge value={employee.user.role} />
                        ) : (
                          <span className="text-xs text-slate-400">No login account</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className="secondary-button !px-3 !py-2"
                            onClick={() => handleEdit(employee)}
                            type="button"
                          >
                            Edit
                          </button>
                          {user?.role === "admin" ? (
                            <button
                              className="danger-button !px-3 !py-2"
                              onClick={() => handleDelete(employee)}
                              type="button"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              description="Try changing the filters or create the first employee record."
              title="No employees found"
            />
          )}
        </div>

        <Pagination onPageChange={setPage} pagination={pagination} />
      </SectionCard>
    </div>
  );
};

export default EmployeesPage;
