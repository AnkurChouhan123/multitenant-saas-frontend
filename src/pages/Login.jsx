// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      window.location.href = "/";
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 min-w-full">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20">
        
        <h1 className="text-3xl font-extrabold text-center text-white tracking-wide mb-2">
          Nimbus SaaS Platform
        </h1>

        <p className="text-gray-300 text-center mb-6 text-sm">
          Login to manage your tenant dashboard
        </p>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-300 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="text-gray-200 text-sm block mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              placeholder="admin@acme.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-gray-200 text-sm block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Login Button */}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-2.5 rounded-lg text-white font-medium shadow-lg shadow-blue-600/30"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-xs">
          © {new Date().getFullYear()} Nimbus SaaS · Multi-tenant platform
        </p>
      </div>
    </div>
  );
}
