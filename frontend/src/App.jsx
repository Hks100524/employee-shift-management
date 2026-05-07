import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import ApplyLeavePage from "./pages/ApplyLeavePage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import LeavesPage from "./pages/LeavesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ShiftsPage from "./pages/ShiftsPage.jsx";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="/employees"
            element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}
          >
            <Route index element={<EmployeesPage />} />
          </Route>
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leaves" element={<LeavesPage />} />
          <Route path="/apply-leave" element={<ApplyLeavePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
