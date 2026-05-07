import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AlertMessage from "../components/AlertMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/http.js";

const LoginPage = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from?.pathname || "/";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to login right now."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-grid px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-soft backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-slate-950 px-6 py-8 text-white sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-300">
            Employee Shift System
          </p>
          <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight">
            Keep teams aligned across shifts, attendance, and leave approvals.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            One workspace for managers, admins, and employees to handle daily operations without
            juggling multiple trackers.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Scheduling</p>
              <p className="mt-3 text-lg font-semibold">No overlap rules</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Attendance</p>
              <p className="mt-3 text-lg font-semibold">Idempotent check-ins</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Leave</p>
              <p className="mt-3 text-lg font-semibold">Approval workflow</p>
            </div>
          </div>
        </section>

        <section className="flex items-center px-4 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Welcome Back
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Sign in to continue</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use the account created for your role to open the workforce console.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <AlertMessage tone="error">{error}</AlertMessage>

              <label className="field-shell">
                <span className="text-sm font-medium text-slate-600">Email</span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={form.email}
                />
              </label>

              <label className="field-shell">
                <span className="text-sm font-medium text-slate-600">Password</span>
                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={form.password}
                />
              </label>

              <button className="primary-button w-full" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-500">
              New to the system?{" "}
              <Link className="font-semibold text-teal-700 hover:text-teal-600" to="/register">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
