import { useState } from "react";
import useAdminAuth from "../hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const { login } = useAdminAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async (e) => {

    e.preventDefault();

    await login(form);

    navigate("/");
  };

  return (
    <form onSubmit={submit}>

      <h2>Admin Login</h2>

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <button>Login</button>

    </form>
  );
            }
