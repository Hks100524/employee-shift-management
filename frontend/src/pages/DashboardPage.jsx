import { useEffect, useState } from "react";
import { formatDate } from "../utils/format.js";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import statsService from "../services/statsService.js";
import { getApiErrorMessage } from "../utils/http.js";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await statsService.getDashboardStats();
        if (!ignore) {
          setStats(response.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, "Failed to load dashboard stats"));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  const renderCards = () => {
    if (!stats) return [];

    const role = user?.role;
    const cards = [];

    if (role === "employee") {
      cards.push(
        { accent: "teal", label: "Today's Shift", value: stats.todaysShifts || 0 },
        { accent: "amber", label: "Pending Leaves", value: stats.pendingLeaves || 0 },
        { 
          accent: "emerald", 
          label: "Attendance Status", 
          value: stats.attendanceSummary ? `${stats.attendanceSummary.present || 0} Present` : "N/A" 
        }
      );
    } else if (role === "manager") {
      cards.push(
        { accent: "teal", label: "Managed Employees", value: stats.managedEmployees || 0 },
        { accent: "amber", label: "Pending Approvals", value: stats.pendingLeaves || 0 },
        { accent: "blue", label: "Today's Shifts", value: stats.todaysShifts || 0 },
        { 
          accent: "emerald", 
          label: "Attendance Overview", 
          value: stats.attendanceSummary ? `${stats.attendanceSummary.present}/${stats.attendanceSummary.totalToday || 0}` : "0/0" 
        }
      );
    } else { // admin
      cards.push(
        { accent: "teal", label: "Total Employees", value: stats.totalEmployees || 0 },
        { accent: "emerald", label: "Active", value: stats.activeEmployees || 0 },
        { accent: "rose", label: "Inactive", value: stats.inactiveEmployees || 0 },
        { accent: "blue", label: "Today's Shifts", value: stats.todaysShifts || 0 },
        { accent: "amber", label: "Pending Leaves", value: stats.pendingLeaves || 0 },
        { 
          accent: "indigo", 
          label: "Attendance", 
          value: stats.attendanceSummary ? `${stats.attendanceSummary.present + (stats.attendanceSummary.partial || 0)}/${stats.attendanceSummary.totalToday || 0}` : "0/0" 
        }
      );
    }

    return cards;
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome ${user?.name || ""}`} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div 
                  key={i} 
                  className="animate-pulse bg-gray-200 h-24 rounded-lg"
                />
              ))
          : renderCards().map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
      </div>

      {/* Recent Data - Simplified for all roles */}
      {!loading && stats && (
        <>
          <SectionCard title="Today's Activity">
            <div className="text-sm text-gray-600">
              Shifts: {stats.todaysShifts || 0} | 
              Pending Leaves: {stats.pendingLeaves || 0} | 
              Attendance: {stats.attendanceSummary ? 
                `${stats.attendanceSummary.present || 0} present, ${stats.attendanceSummary.partial || 0} partial` : 
                "No data"}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

