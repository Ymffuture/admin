import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import MenuManager from "./pages/MenuManager";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* BUG FIX: Dashboard and MenuManager were NOT wrapped in ProtectedRoute
            — any unauthenticated user could access them */}
        <Route
          path="/"
          element={
            
              <Dashboard />
            
          }
        />
        <Route
          path="/orders"
          element={
            
              <Orders />
            
          }
        />
        <Route
          path="/menu"
          element={
            
              <MenuManager />
            
          }
        />
        <Route
          path="/analytics"
          element={
            
              <Analytics />
            
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
