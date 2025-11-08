import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { useUserStore } from "@/context/useUserStore";
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { socketService } from "@/lib/socket";

interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  _id: string;
}

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
  partner: string;
  items: OrderItem[];
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
  __v: number;
}

const PartnerOrders = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${backendUrl}/api/partners/orders?status=all`,
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
      } catch (error) {
        toast.error("Failed to load orders");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [backendUrl, token]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (token) {
      socketService.connect(token);

      // Listen for order claimed events from other partners
      socketService.onOrderClaimed((data) => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== data.orderId)
        );
      });

      return () => {
        socketService.offOrderClaimed();
      };
    }
  }, [token]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(
        `${backendUrl}/api/partners/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order status");
      }

      await response.json();

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update order status"
      );
      console.error(error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "Accepted":
        return "On The Way";
      case "On The Way":
        return "Delivered";
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <Package className="w-4 h-4" />;
      case "on the way":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "delivered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status.toLowerCase() === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/Partner")}
        className="mb-4 flex items-center gap-2 cursor-pointer hover:bg-purple-200/30"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
      <div className="max-w-7xl mx-auto">
        <HyperText className="text-4xl font-bold mb-8 text-center">
          Partner Orders
        </HyperText>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 border-b border-purple-200">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {order.user.fullname.firstname}{" "}
                        {order.user.fullname.lastname}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.user.email}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-100"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-contain rounded-md bg-white p-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize mt-1">
                            {item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-700">
                            ₹{item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <p>
                        Created:{" "}
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="mt-1">
                        Updated:{" "}
                        {new Date(order.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(order.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-purple-700">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  {getNextStatus(order.status) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Update Status:
                        </span>
                        <Button
                          onClick={() =>
                            updateOrderStatus(
                              order._id,
                              getNextStatus(order.status)!
                            )
                          }
                          disabled={updatingOrderId === order._id}
                          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                        >
                          {getStatusIcon(getNextStatus(order.status)!)}
                          {updatingOrderId === order._id
                            ? "Updating..."
                            : `Mark as ${getNextStatus(order.status)}`}
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.status === "Delivered" && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">
                          Order Completed Successfully!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerOrders;
