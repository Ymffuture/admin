import { NavLink, useNavigate } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed,
  BarChart3, Bike, LogOut, Sparkles, Menu, X,
  ChevronRight, Bell,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/orders",    icon: ClipboardList,   label: "Orders"     },
  { to: "/menu",      icon: UtensilsCrossed, label: "Menu"       },
  { to: "/drivers",   icon: Bike,            label: "Drivers"    },
  { to: "/analytics", icon: BarChart3,       label: "Analytics"  },
];

export default function Layout({ children }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-60 rounded-xl" />
          <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <p className="font-bold text-white text-sm">KotaBites</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "group-hover:text-white"}`} />
                  {label}
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <p className="text-xs text-slate-400 truncate flex-1">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex text-slate-200">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0d0d14] border-r border-white/8 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-[#0d0d14] border-r border-white/8 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-5 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/8">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
