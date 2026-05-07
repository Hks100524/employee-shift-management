import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import AlertMessage from "../components/AlertMessage.jsx";

import leaveService from "../services/leaveService.js";
import { getApiErrorMessage } from "../utils/http";

const ApplyLeavePage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        leave_type: form.leaveType,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason,
      };

      await leaveService.applyLeave(payload);
      setSuccess("Leave application submitted successfully!");
      setForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setTimeout(() => {
        navigate("/leaves");
      }, 1500);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to submit leave application."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request. Your manager will review and approve it."
        eyebrow="Leave"
      />

      {error && <AlertMessage tone="error">{error}</AlertMessage>}
      {success && <AlertMessage tone="success">{success}</AlertMessage>}

      <SectionCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Select leave type</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                placeholder="Brief reason for leave"
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="primary-button disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/leaves")}
              className="secondary-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default ApplyLeavePage;
