import { Link } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed, 
  BarChart3, 
  LogOut, 
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      to: "/orders",
      icon: ClipboardList,
      title: "Orders",
      description: "View and manage customer orders",
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "group-hover:shadow-amber-500/20"
    },
    {
      to: "/menu",
      icon: UtensilsCrossed,
      title: "Menu",
      description: "Add, edit and delete menu items",
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "group-hover:shadow-emerald-500/20"
    },
    {
      to: "/analytics",
      icon: BarChart3,
      title: "Analytics",
      description: "Sales and order trends",
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "group-hover:shadow-violet-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 selection:bg-indigo-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 blur-3xl" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* TOP NAV - Glassmorphism */}
      <nav className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              KotaBites
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-slate-400">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-12 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="uppercase tracking-wider">Overview</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-slate-400 text-lg max-w-xl">
            Welcome back. Manage your store operations with intelligent insights.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.05] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${item.bgGlow}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon Container */}
              <div className={`relative mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                    {item.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                  {item.description}
                </p>
              </div>

              {/* Bottom Accent Line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${item.gradient} w-0 group-hover:w-full transition-all duration-500 ease-out`} />
            </Link>
          ))}
        </div>

        {/* Stats Preview (Optional Enhancement) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Today's Orders", value: "24", change: "+12%" },
            { label: "Revenue", value: "R2.4k", change: "+8%" },
            { label: "Active Items", value: "18", change: "+2" },
            { label: "Avg. Rating", value: "4.8", change: "+0.2" }
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-emerald-400 text-xs mb-1">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
