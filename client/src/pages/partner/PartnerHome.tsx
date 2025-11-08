import PartnerHeader from "@/components/_partner/PartnerHeader";
import { useUserStore } from "@/context/useUserStore";
import { useEffect, useState } from "react";
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
  partner: null;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  isLocked: boolean;
  lockedBy: null;
  lockedAt: null;
  lockExpiry: null;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const PartnerHome = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchUnclaimedOrders();
  }, []);

  const fetchUnclaimedOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${backendUrl}/api/partners/orders/unclaimed`,
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
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch unclaimed orders");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    try {
      setClaimingOrderId(orderId);
      const response = await fetch(
        `${backendUrl}/api/partners/orders/${orderId}/claim`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to claim order");
      }

      toast.success("Order claimed successfully!");
      fetchUnclaimedOrders();
    } catch (error) {
      console.error("Error claiming order:", error);
      toast.error("Failed to claim order");
    } finally {
      setClaimingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <PartnerHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Available Orders
          </h1>
          <p className="text-gray-600">Claim orders to start delivering</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Unclaimed Orders
            </h3>
            <p className="text-gray-500">
              Check back later for new delivery opportunities
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-purple-100 flex flex-col"
              >
                <div className="bg-gradient-to-r from-purple-200 to-purple-100 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.user.fullname.firstname}{" "}
                        {order.user.fullname.lastname}
                      </p>
                    </div>
                    <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ₹{order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Order Items ({order.items.length})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 object-contain rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-orange-600">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium text-orange-600">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimOrder(order._id)}
                    disabled={claimingOrderId === order._id}
                    className="w-full cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                  >
                    {claimingOrderId === order._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Claim Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerHome;
