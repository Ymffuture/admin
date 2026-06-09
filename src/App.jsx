import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const Dashboard     = lazy(() => import("./pages/Dashboard"));
const Orders        = lazy(() => import("./pages/Orders"));
const MenuManager   = lazy(() => import("./pages/MenuManager"));
const Analytics     = lazy(() => import("./pages/Analytics"));
const Drivers       = lazy(() => import("./pages/Drivers"));
const Users         = lazy(() => import("./pages/Users"));          // ← NEW
const Notifications = lazy(() => import("./pages/Notifications"));  // ← NEW

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
  <div className="flex flex-col items-center gap-4">

    {/* Spinner */}
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200/20" />
      <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-indigo-400/60 border-b-transparent border-l-transparent animate-spin" />
    </div>

    {/* Text */}
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span>Loading</span>

      {/* Animated dots */}
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>

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

        <Route path="/"               element={<ProtectedLayout><Dashboard     /></ProtectedLayout>} />
        <Route path="/orders"         element={<ProtectedLayout><Orders         /></ProtectedLayout>} />
        <Route path="/menu"           element={<ProtectedLayout><MenuManager    /></ProtectedLayout>} />
        <Route path="/analytics"      element={<ProtectedLayout><Analytics      /></ProtectedLayout>} />
        <Route path="/drivers"        element={<ProtectedLayout><Drivers        /></ProtectedLayout>} />
        <Route path="/users"          element={<ProtectedLayout><Users          /></ProtectedLayout>} />   {/* ← NEW */}
        <Route path="/notifications"  element={<ProtectedLayout><Notifications  /></ProtectedLayout>} />   {/* ← NEW */}

        {/* Catch-all → login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
