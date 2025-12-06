import React from "react";
import { Link } from "react-router-dom";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-6">
        <h1 className="text-xl font-bold mb-6">Super Admin</h1>

        <nav className="space-y-3">
          <Link to="/superadmin/dashboard" className="block hover:text-blue-400">Dashboard</Link>
          <Link to="/superadmin/tenants" className="block hover:text-blue-400">Tenants</Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
