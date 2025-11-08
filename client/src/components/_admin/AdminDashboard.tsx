import { useUserStore } from "@/context/useUserStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface DashboardStats {
  stats: {
    users: {
      total: number;
      active: number;
    };
    partners: {
      total: number;
      active: number;
    };
    orders: {
      total: number;
      pending: number;
      accepted: number;
      onTheWay: number;
      delivered: number;
      cancelled: number;
    };
    revenue: {
      total: number;
    };
  };
  recentOrders: any[];
}

export const AdminDashboard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/admin/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [backendUrl, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;

  const StatCard = ({
    icon,
    label,
    value,
    subtext,
    bgColor,
    borderColor,
    textColor,
  }: {
    icon: string;
    label: string;
    value: string;
    subtext: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }) => (
    <div className="group relative">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgColor} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300`}
      ></div>
      <div
        className={`relative ${bgColor} ${borderColor} border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl p-6 shadow-md`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className={`${textColor} text-sm font-semibold`}>{label}</span>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${bgColor}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        <div className={`${textColor} text-4xl font-bold mb-2`}>{value}</div>
        <p className="text-purple-600 text-xs font-medium">{subtext}</p>
      </div>
    </div>
  );

  const NavButton = ({
    label,
    icon,
    onClick,
  }: {
    label: string;
    icon: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r cursor-pointer from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400 text-purple-600 font-semibold py-6 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-purple-700">
          Welcome back! Here's your business overview
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <NavButton
          label="All Users"
          icon="👥"
          onClick={() => navigate("/usersList")}
        />
        <NavButton
          label="All Partners"
          icon="⚡"
          onClick={() => navigate("/partnersList")}
        />
        <NavButton
          label="All Orders"
          icon="🛍️"
          onClick={() => navigate("/ordersList")}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.users.total.toLocaleString()}
          subtext={`${stats.users.active} Active Users`}
          bgColor="from-purple-100 to-purple-50"
          borderColor="border-purple-200"
          textColor="text-purple-900"
        />

        <StatCard
          icon="⚡"
          label="Total Partners"
          value={stats.partners.total.toLocaleString()}
          subtext={`${stats.partners.active} Active Partners`}
          bgColor="from-blue-100 to-blue-50"
          borderColor="border-blue-200"
          textColor="text-blue-900"
        />

        <StatCard
          icon="🛍️"
          label="Total Orders"
          value={stats.orders.total.toLocaleString()}
          subtext={`${stats.orders.delivered} Delivered`}
          bgColor="from-emerald-100 to-emerald-50"
          borderColor="border-emerald-200"
          textColor="text-emerald-900"
        />

        <StatCard
          icon="💰"
          label="Total Revenue"
          value={`₹${(stats.revenue.total / 1000).toFixed(1)}K`}
          subtext="Revenue Generated"
          bgColor="from-amber-100 to-amber-50"
          borderColor="border-amber-200"
          textColor="text-amber-900"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold text-purple-900 mb-6">
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Pending",
              value: stats.orders.pending,
              icon: "⏳",
              bgColor: "from-yellow-100 to-yellow-50",
              borderColor: "border-yellow-200",
              textColor: "text-yellow-900",
            },
            {
              label: "Accepted",
              value: stats.orders.accepted,
              icon: "✅",
              bgColor: "from-blue-100 to-blue-50",
              borderColor: "border-blue-200",
              textColor: "text-blue-900",
            },
            {
              label: "On the Way",
              value: stats.orders.onTheWay,
              icon: "🚚",
              bgColor: "from-indigo-100 to-indigo-50",
              borderColor: "border-indigo-200",
              textColor: "text-indigo-900",
            },
            {
              label: "Delivered",
              value: stats.orders.delivered,
              icon: "📦",
              bgColor: "from-emerald-100 to-emerald-50",
              borderColor: "border-emerald-200",
              textColor: "text-emerald-900",
            },
            {
              label: "Cancelled",
              value: stats.orders.cancelled,
              icon: "❌",
              bgColor: "from-red-100 to-red-50",
              borderColor: "border-red-200",
              textColor: "text-red-900",
            },
          ].map((status) => (
            <div key={status.label} className="group">
              <div
                className={`bg-gradient-to-br ${status.bgColor} ${status.borderColor} border-2 hover:shadow-md transition-all duration-300 rounded-lg p-4 text-center hover:scale-105`}
              >
                <div className="text-3xl mb-2">{status.icon}</div>
                <p className="text-purple-700 text-xs font-semibold mb-1">
                  {status.label}
                </p>
                <p className={`${status.textColor} text-2xl font-bold`}>
                  {status.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
