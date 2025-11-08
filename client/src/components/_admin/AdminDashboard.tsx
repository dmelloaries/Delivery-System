import { useUserStore } from "@/context/useUserStore";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

  return (
    <>
      <div className="flex justify-between px-4 mt-4">
        <Button
          className="bg-purple-200 p-6 cursor-pointer text-2xl text-purple-600 hover:bg-purple-300"
          onClick={() => {
            navigate("/UsersList");
          }}
        >
          All Users
        </Button>

        <Button
          className="bg-purple-200 p-6 cursor-pointer text-2xl text-purple-600 hover:bg-purple-300"
          onClick={() => {
            navigate("/PartnersList");
          }}
        >
          All Partners
        </Button>

        <Button
          className="bg-purple-200 p-6 cursor-pointer text-2xl text-purple-600 hover:bg-purple-300"
          onClick={() => {
            navigate("/OrdersList");
          }}
        >
          All Orders
        </Button>
      </div>
      <hr className="mt-4 mb-4" />

      {/* Display the stats here */}
      <div className="px-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Users Stats */}
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {stats.users.total}
              </div>
              <p className="text-sm text-purple-600">
                Active: {stats.users.active}
              </p>
            </CardContent>
          </Card>

          {/* Partners Stats */}
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {stats.partners.total}
              </div>
              <p className="text-sm text-purple-600">
                Active: {stats.partners.active}
              </p>
            </CardContent>
          </Card>

          {/* Orders Stats */}
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {stats.orders.total}
              </div>
              <div className="mt-2 space-y-1 text-xs text-purple-600">
                <p>Pending: {stats.orders.pending}</p>
                <p>Accepted: {stats.orders.accepted}</p>
                <p>On the Way: {stats.orders.onTheWay}</p>
                <p>Delivered: {stats.orders.delivered}</p>
                <p>Cancelled: {stats.orders.cancelled}</p>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Stats */}
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                ${stats.revenue.total.toFixed(2)}
              </div>
              <p className="text-sm text-purple-600">Total Revenue</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
