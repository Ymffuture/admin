import { useState } from "react";
import { loginAdmin, logout as apiLogout } from "../api/auth.api";

export default function useAdminAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"));
    } catch {
      return null;
    }
  });

  const login = async ({ email, password }) => {
    // loginAdmin handles OAuth2 form encoding AND saves token to localStorage
    const res = await loginAdmin({ email, password });

    // BUG FIX: old code saved res.data ({access_token, token_type}) as adminUser
    // and never saved "token" key — so the axios interceptor never sent auth headers.
    // Now we save a proper user object with email for display purposes.
    const userData = { email, access_token: res.data.access_token };
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return { user, login, logout };
}
