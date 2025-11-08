import { HyperText } from "@/components/ui/hyper-text";
import { useUserStore } from "@/context/useUserStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import UserHeader from "@/components/_user/UserHeader";
import { socketService } from "@/lib/socket";
import type { OrderStatusUpdate } from "@/lib/socket";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  _id: string;
}

interface Partner {
  fullname: {
    firstname: string;
    lastname: string;
  };
  _id: string;
  email: string;
}

interface Order {
  _id: string;
  user: string;
  partner: Partner | null;
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

interface OrdersResponse {
  orders: Order[];
}

const UserOrders = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedOrderIds, setUpdatedOrderIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const authToken = token || localStorage.getItem("token");

        const response = await fetch(`${backendUrl}/api/users/orders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data: OrdersResponse = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [backendUrl, token]);

  // Initialize Socket.io connection and set up event listeners (once on mount)
  useEffect(() => {
    const authToken = token || localStorage.getItem("token");

    if (!authToken) {
      console.warn("⚠️ No auth token found, skipping socket connection");
      return;
    }

    console.log("🔌 Initializing socket connection for user...");
    const socket = socketService.connect(authToken);

    // Set up event listeners for order status updates
    const handleOrderStatusUpdate = (data: OrderStatusUpdate) => {
      console.log(" Order status update received:", data);
      console.log("   Order ID:", data.orderId);
      console.log("   New Status:", data.status);
      console.log("   Message:", data.message);

      // Update the order in local state
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status } : order
        );
        console.log("   Updated orders in state");
        return updatedOrders;
      });

      // Add to updated orders for animation
      setUpdatedOrderIds((prev) => new Set(prev).add(data.orderId));

      // Remove after animation completes
      setTimeout(() => {
        setUpdatedOrderIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.orderId);
          return newSet;
        });
      }, 2000);

      // Show toast notification
      toast.success(data.message, {
        description: `Order #${data.orderNumber}`,
      });
    };

    const handleOrderDelivered = (data: OrderStatusUpdate) => {
      console.log("🎉 Order delivered:", data);

      // Update order status to delivered
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId ? { ...order, status: "Delivered" } : order
        )
      );

      toast.success("🎉 " + data.message, {
        description: `Order #${data.orderNumber}`,
        duration: 5000,
      });
    };

    // Register event listeners
    console.log(" Registering socket event listeners...");
    socketService.onOrderStatusUpdate(handleOrderStatusUpdate);
    socketService.onOrderDelivered(handleOrderDelivered);

    const handleConnect = () => {
      console.log("Socket connected successfully! Socket ID:", socket.id);
      console.log("   Auth token present:", !!authToken);
    };

    const handleDisconnect = (reason: string) => {
      console.warn(" Socket disconnected. Reason:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket listeners...");
      socketService.offOrderStatusUpdate();
      socketService.offOrderDelivered();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [token]); // Only depend on token

  // Join/leave order rooms when orders change
  useEffect(() => {
    // Small delay to ensure socket is fully connected
    const joinRooms = () => {
      if (!socketService.isConnected()) {
        console.warn("Socket not connected, retrying in 500ms...");
        setTimeout(joinRooms, 500);
        return;
      }

      if (orders.length === 0) {
        console.log("ℹ No orders to track");
        return;
      }

      console.log(" Joining order rooms for", orders.length, "orders");

      // Join all active order rooms
      const activeOrders = orders.filter(
        (order) => order.status !== "Delivered" && order.status !== "Cancelled"
      );

      console.log(`   Active orders to track: ${activeOrders.length}`);

      activeOrders.forEach((order) => {
        console.log(
          ` Joining room for order: ${order._id} (Status: ${order.status})`
        );
        socketService.joinOrderRoom(order._id);
      });
    };

    joinRooms();

    // Cleanup: leave rooms when component unmounts or orders change
    return () => {
      console.log(" Leaving order rooms on cleanup...");
      orders.forEach((order) => {
        if (order.status !== "Delivered" && order.status !== "Cancelled") {
          console.log(` Leaving room for order: ${order._id}`);
          socketService.leaveOrderRoom(order._id);
        }
      });
    };
  }, [orders]); // Re-run when orders array changes

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "accepted":
        return "text-blue-600 bg-blue-100";
      case "on the way":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStep = (status: string) => {
    const steps = ["Pending", "Accepted", "On The Way", "Delivered"];
    return steps.indexOf(status);
  };

  const renderOrderTracker = (status: string) => {
    const steps = [
      { name: "Pending", icon: Clock },
      { name: "Accepted", icon: Package },
      { name: "On The Way", icon: Truck },
      { name: "Delivered", icon: CheckCircle2 },
    ];

    const currentStep = getStatusStep(status);

    return (
      <div className="py-4">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.name} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-purple-200 scale-110" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCompleted ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/user")}
          className="mb-4 flex items-center gap-2 cursor-pointer hover:bg-purple-200/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <HyperText className="text-3xl font-bold mb-6">My Orders</HyperText>
        <div className="text-center py-10">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/user")}
          className="mb-4 flex items-center gap-2 cursor-pointer hover:bg-purple-200/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <HyperText className="text-3xl font-bold mb-6">My Orders</HyperText>
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <UserHeader />
      <Button
        variant="ghost"
        onClick={() => navigate("/user")}
        className="mb-4 flex items-center gap-2 cursor-pointer mt-3 hover:bg-purple-200/30"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
      <HyperText className="text-3xl mb-6 text-purple-400">My Orders</HyperText>

      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No orders found. Start shopping to place your first order!
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order._id}
              className={`overflow-hidden border-purple-200/50 hover:border-purple-200 transition-all ${
                updatedOrderIds.has(order._id)
                  ? "ring-2 ring-purple-400 shadow-lg animate-pulse"
                  : ""
              }`}
            >
              <CardHeader className="bg-purple-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-2">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Placed on: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Live Order Status Tracker */}
                {order.status !== "Cancelled" && (
                  <div className="mb-6 pb-6 border-b border-purple-200/40">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Order Status
                      {order.status !== "Delivered" && (
                        <span className="ml-2 text-xs text-purple-600 animate-pulse">
                          • Live
                        </span>
                      )}
                    </h4>
                    {renderOrderTracker(order.status)}
                  </div>
                )}
                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-contain rounded border border-purple-200/40"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.category}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          ₹{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Partner Info */}
                {order.partner && (
                  <div className="border-t border-purple-200/40 pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700">
                      Delivery Partner:
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.partner.fullname.firstname}{" "}
                      {order.partner.fullname.lastname}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.partner.email}
                    </p>
                  </div>
                )}

                {/* Total Amount */}
                <div className="border-t border-purple-200/40 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-lg">Total Amount:</span>
                  <span className="font-bold text-2xl text-green-600">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
