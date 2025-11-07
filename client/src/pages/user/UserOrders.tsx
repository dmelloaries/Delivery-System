import { HyperText } from "@/components/ui/hyper-text";
import { useUserStore } from "@/context/useUserStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserHeader from "@/components/_user/UserHeader";

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
              className="overflow-hidden border-purple-200/50 hover:border-purple-200 transition-colors"
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
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
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
                    ${order.totalAmount.toFixed(2)}
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
