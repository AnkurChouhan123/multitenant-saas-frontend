import SuperAdminLayout from "../../components/layout/SuperAdminLayout";

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout>
      <h2 className="text-3xl font-semibold mb-4">Super Admin Dashboard</h2>
      <p className="text-gray-600">See global tenant statistics here.</p>
    </SuperAdminLayout>
  );
}
