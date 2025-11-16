import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-2 text-gray-600">Tenant: {user?.tenantId}</p>
    </div>
  );
}
