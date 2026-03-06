import { useState } from "react";
import { loginAdmin } from "../api/auth.api";

export default function useAdminAuth() {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("adminUser"))
  );

  const login = async (data) => {

    const res = await loginAdmin(data);

    localStorage.setItem(
      "adminUser",
      JSON.stringify(res.data)
    );

    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  return { user, login, logout };
}
