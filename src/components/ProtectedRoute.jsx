import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"));
    } catch {
      return null;
    }
  })();

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
