import { useUserStore } from "@/context/useUserStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  _id: string;
  user: {
    fullname: {
      firstname: string;
      lastname: string;
    };
    _id: string;
    email: string;
  };
  partner: {
    fullname: {
      firstname: string;
      lastname: string;
    };
    _id: string;
    email: string;
  } | null;
  items: {
    id: number;
    title: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
    _id: string;
  }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  isLocked: boolean;
  lockedBy: string | null;
  lockedAt: string | null;
  lockExpiry: string | null;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

const OrdersList = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${backendUrl}/api/admin/orders?page=${page}&limit=20&status=all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "confirmed":
        return "text-blue-600 bg-blue-50";
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-purple-600 animate-pulse">
          Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/adminHome")}
        className="mb-4 flex items-center gap-2 cursor-pointer mt-3 hover:bg-purple-200/30"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600">
            Manage and track all orders in the system
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-purple-200">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="border-purple-100 hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-800">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Delivery Status
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Payment Status
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                        Customer Details
                      </h3>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-800">
                          {order.user.fullname.firstname}{" "}
                          {order.user.fullname.lastname}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Partner Info */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                        Delivery Partner
                      </h3>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        {order.partner ? (
                          <>
                            <p className="font-medium text-gray-800">
                              {order.partner.fullname.firstname}{" "}
                              {order.partner.fullname.lastname}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.partner.email}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Not assigned yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-contain rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="mt-6 pt-4 border-t border-purple-100">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-purple-700">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Lock Status */}
                  {order.isLocked && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        🔒 This order is currently locked
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
