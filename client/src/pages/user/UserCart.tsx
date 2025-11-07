import { HyperText } from "@/components/ui/hyper-text";
import { useUserStore } from "@/context/useUserStore";
import { useCartStore } from "@/context/useCartStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import UserHeader from "@/components/_user/UserHeader";
import { useNavigate } from "react-router-dom";

const UserCart = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const { items, totalAmount, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const navigate = useNavigate();

  const authToken = token || localStorage.getItem("token");

  const rupee = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        })),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      };

      console.log("Placing order with data:", orderData);
      console.log("Authorization token:", authToken);

      const response = await fetch(`${backendUrl}/api/users/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const result = await response.json();
      console.log("Order placed successfully:", result);

      toast.success("Order placed successfully!", {
        duration: 3000,
      });

      // Clear the cart after successful order
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <UserHeader />
      <div>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/user")}
            className="mb-4 flex items-center gap-2 cursor-pointer hover:bg-purple-200/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <HyperText className="text-3xl mb-6 text-purple-400">
            Shopping Cart
          </HyperText>

          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some products to get started!
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-24 h-24 object-contain rounded-md bg-muted/30"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="grow">
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {item.category}
                          </p>
                          <p className="text-lg font-bold text-emerald-600 mt-2">
                            {rupee.format(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-2 border rounded-md">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Subtotal
                          </p>
                          <p className="text-lg font-bold">
                            {rupee.format(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span>
                          {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{rupee.format(totalAmount)}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-emerald-600">
                          {rupee.format(totalAmount)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? "Placing Order..." : "Proceed to Order"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearCart}
                      disabled={isPlacingOrder}
                    >
                      Clear Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserCart;
