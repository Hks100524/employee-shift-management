import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", path: "/", roles: ["admin", "manager", "employee"] },
  { label: "Employees", path: "/employees", roles: ["admin", "manager"] },
  { label: "Shifts", path: "/shifts", roles: ["admin", "manager", "employee"] },
  { label: "Attendance", path: "/attendance", roles: ["admin", "manager", "employee"] },
  { label: "Leaves", path: "/leaves", roles: ["admin", "manager", "employee"] },
];

const AppLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-hero-grid px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5">
      <div className="mx-auto grid max-w-7xl gap-4 sm:gap-5 lg:grid-cols-[minmax(240px,260px)_minmax(0,1fr)]">
        <aside className="glass-card rounded-[28px] border border-white/60 p-4 sm:p-5 lg:p-6 shadow-soft hidden lg:block">
          <div className="rounded-[24px] bg-slate-900 p-4 sm:p-5 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200">ShiftSync</p>
            <h1 className="mt-3 text-xl sm:text-2xl font-semibold">Workforce Console</h1>
            <p className="mt-2 text-sm text-slate-300">
              Schedule smarter, track attendance cleanly, and keep leave approvals in one flow.
            </p>
          </div>

          <div className="mt-5 rounded-[24px] bg-white/80 p-3 sm:p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed In As</p>
            <p className="mt-2 text-base sm:text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              {user?.role}
            </span>
          </div>

          <nav className="mt-5 flex flex-col gap-2">
            {navItems
              .filter((item) => item.roles.includes(user?.role))
              .map((item) => (
                <NavLink
                  key={item.path}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-lg"
                        : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-md"
                    }`
                  }
                  end={item.path === "/"}
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>

          <button className="secondary-button mt-5 w-full" onClick={logout} type="button">
            Logout
          </button>
        </aside>

        <main className="glass-card rounded-[28px] border border-white/60 p-3 sm:p-5 lg:p-6 shadow-soft">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

