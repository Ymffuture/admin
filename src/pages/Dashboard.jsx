import { Link } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP NAV */}
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🍔 KotaBites Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-500 mb-8">Welcome back. Manage your store below.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/orders" className="group bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-lg">Orders</h3>
            <p className="text-gray-500 text-sm mt-1">View and manage customer orders</p>
          </Link>

          <Link to="/menu" className="group bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="text-4xl mb-3">🍔</div>
            <h3 className="font-bold text-lg">Menu</h3>
            <p className="text-gray-500 text-sm mt-1">Add, edit and delete menu items</p>
          </Link>

          <Link to="/analytics" className="group bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-lg">Analytics</h3>
            <p className="text-gray-500 text-sm mt-1">Sales and order trends</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
