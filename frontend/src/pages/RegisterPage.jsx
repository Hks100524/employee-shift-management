import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AlertMessage from "../components/AlertMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDateInputValue } from "../utils/format.js";
import { getApiErrorMessage } from "../utils/http.js";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "Operations",
    branch: "Head Office",
    designation: "Executive",
    joiningDate: getDateInputValue(),
  }));

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    const email = form.email.trim();
    const password = form.password;
    const joiningDate = form.joiningDate;

    if (!email) throw new Error("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");
    if (!password) throw new Error("Password is required.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    if (!joiningDate || !/^\d{4}-\d{2}-\d{2}$/.test(joiningDate)) {
      throw new Error("Joining date must be in YYYY-MM-DD format.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      validateForm();
      setLoading(true);

      const { joiningDate, ...payloadWithoutDate } = form;
      const payload = {
        ...payloadWithoutDate,
        email: form.email.trim().toLowerCase(),
        joining_date: joiningDate,
      };

      await register(payload);

      navigate("/", { replace: true });
    } catch (requestError) {
      if (requestError instanceof Error && !requestError.response) {
        setError(requestError.message);
      } else {
        const errorMsg = getApiErrorMessage(requestError, "Unable to create your account.");
        if (requestError?.response?.status === 409) {
          setError(
            <>
              Account with this email already exists.
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 underline ml-1">
                {"Try login ->"}
              </Link>
            </>
          );
        } else {
          setError(errorMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-grid px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-soft backdrop-blur lg:grid lg:grid-cols-[0.92fr_1.08fr]">
        <section className="bg-gradient-to-br from-teal-600 to-slate-900 px-6 py-8 text-white sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-100">
            Initial Setup
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">
            Create a workspace account and start managing operations in one place.
          </h1>
          <ul className="mt-8 space-y-4 text-sm text-teal-50">
            <li className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
              Employee details and login access are created together.
            </li>
            <li className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
              The first setup account can request elevated access for system configuration.
            </li>
            <li className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
              Later registrations safely default to employee access from the backend.
            </li>
          </ul>
        </section>

        <section className="px-4 py-6 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Register
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            Create your account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fill the basics now. You can manage additional employees after login.
          </p>

          <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <AlertMessage tone="error">{error}</AlertMessage>
            </div>

            <label className="field-shell sm:col-span-2">
              <span className="text-sm font-medium text-slate-600">Full name</span>
              <input name="name" onChange={handleChange} required type="text" value={form.name} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Email</span>
              <input
                autoComplete="email"
                name="email"
                onChange={handleChange}
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Password</span>
              <input
                autoComplete="new-password"
                minLength={6}
                name="password"
                onChange={handleChange}
                required
                type="password"
                value={form.password}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Department</span>
              <input name="department" onChange={handleChange} required type="text" value={form.department} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Branch</span>
              <input name="branch" onChange={handleChange} required type="text" value={form.branch} />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Designation</span>
              <input
                name="designation"
                onChange={handleChange}
                required
                type="text"
                value={form.designation}
              />
            </label>

            <label className="field-shell">
              <span className="text-sm font-medium text-slate-600">Joining date</span>
              <input
                name="joiningDate"
                onChange={handleChange}
                required
                type="date"
                value={form.joiningDate}
              />
            </label>

            <label className="field-shell sm:col-span-2">
              <span className="text-sm font-medium text-slate-600">Requested role</span>
              <select name="role" onChange={handleChange} value={form.role}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button className="primary-button sm:min-w-40" disabled={loading} type="submit">
                {loading ? "Creating account..." : "Register"}
              </button>

              <Link className="secondary-button sm:min-w-40" to="/login">
                Back to login
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
