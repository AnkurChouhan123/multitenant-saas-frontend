import React, { useEffect, useState } from "react";
import tenantService from "../../services/tenantService";
import SuperAdminLayout from "../../components/layout/SuperAdminLayout";

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    tenantService.getAllTenants().then(setTenants);
  }, []);

  return (
    <SuperAdminLayout>
      <h2 className="text-2xl font-bold mb-6">All Tenants</h2>

      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Subdomain</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-3">{t.id}</td>
              <td className="p-3">{t.name}</td>
              <td className="p-3">{t.subdomain}</td>
              <td className="p-3">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SuperAdminLayout>
  );
}
