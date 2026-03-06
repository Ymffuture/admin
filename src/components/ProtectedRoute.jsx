import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const user = JSON.parse(localStorage.getItem("adminUser"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
