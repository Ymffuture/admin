import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import useAdminAuth from "../hooks/useAdminAuth";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-black text-white text-xl mb-5">
            🍔
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
            KotaBites
          </h1>

          <p className="mt-3 text-zinc-500">
            Sign in to the admin workspace
          </p>
        </div>

        {/* Card */}

        <div className="rounded-3xl border border-zinc-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Email
              </label>

              <input
                type="email"
                required
                value={form.email}
                placeholder="admin@kotabites.com"
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition-all
                  focus:border-zinc-900
                  focus:ring-4
                  focus:ring-zinc-100
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  placeholder="Enter password"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    px-4
                    py-3
                    pr-12
                    text-sm
                    outline-none
                    transition-all
                    focus:border-zinc-900
                    focus:ring-4
                    focus:ring-zinc-100
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-500
                    hover:text-zinc-900
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-2xl
                bg-black
                py-3.5
                text-white
                font-medium
                transition-all
                hover:opacity-90
                disabled:opacity-50
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Secure access to the KotaBites management platform.
        </p>
      </div>
    </main>
  );
}
