import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const Dashboard   = lazy(() => import("./pages/Dashboard"));
const Orders      = lazy(() => import("./pages/Orders"));
const MenuManager = lazy(() => import("./pages/MenuManager"));
const Analytics   = lazy(() => import("./pages/Analytics"));
const Drivers     = lazy(() => import("./pages/Drivers"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/"          element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/orders"    element={<ProtectedLayout><Orders /></ProtectedLayout>} />
        <Route path="/menu"      element={<ProtectedLayout><MenuManager /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
        <Route path="/drivers"   element={<ProtectedLayout><Drivers /></ProtectedLayout>} />

        {/* Catch-all → login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
