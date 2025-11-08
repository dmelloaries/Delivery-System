import { io, Socket } from "socket.io-client";

export interface OrderStatusUpdate {
  orderId: string;
  orderNumber: string;
  status: string;
  message: string;
  timestamp: Date;
  partner?: {
    _id: string;
    fullname: {
      firstname: string;
      lastname: string;
    };
  };
}

export interface NewOrderData {
  orderId: string;
  timestamp: Date;
  message: string;
}

export interface OrderClaimedData {
  orderId: string;
  partnerId: string;
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  connect(token: string) {
    // Return existing connection if already connected or connecting
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      return this.socket;
    }

    if (this.isConnecting) {
      console.log("⏳ Socket connection in progress...");
      return this.socket!;
    }

    this.isConnecting = true;
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    console.log("🔌 Connecting to socket server:", backendUrl);

    this.socket = io(backendUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected successfully! ID:", this.socket?.id);
      this.isConnecting = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      this.isConnecting = false;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt", attemptNumber);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Join a specific order room for real-time updates
  joinOrderRoom(orderId: string) {
    if (this.socket?.connected) {
      console.log(` Emitting join-order-room for: ${orderId}`);
      this.socket.emit("join-order-room", orderId);
    } else {
      console.error(` Cannot join room ${orderId} - socket not connected`);
    }
  }

  // Leave an order room
  leaveOrderRoom(orderId: string) {
    if (this.socket?.connected) {
      console.log(`Emitting leave-order-room for: ${orderId}`);
      this.socket.emit("leave-order-room", orderId);
    } else {
      console.warn(` Cannot leave room ${orderId} - socket not connected`);
    }
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback: (data: OrderStatusUpdate) => void) {
    if (this.socket) {
      this.socket.on("order-status-update", callback);
    }
  }

  // Listen for order delivered notifications
  onOrderDelivered(callback: (data: OrderStatusUpdate) => void) {
    if (this.socket) {
      this.socket.on("order-delivered", callback);
    }
  }

  // Remove order status update listener
  offOrderStatusUpdate() {
    if (this.socket) {
      this.socket.off("order-status-update");
    }
  }

  // Remove order delivered listener
  offOrderDelivered() {
    if (this.socket) {
      this.socket.off("order-delivered");
    }
  }

  // Listen for new orders (partners only)
  onNewOrder(callback: (data: NewOrderData) => void) {
    if (this.socket) {
      this.socket.on("new-order", callback);
    }
  }

  // Remove new order listener
  offNewOrder() {
    if (this.socket) {
      this.socket.off("new-order");
    }
  }

  // Listen for order claimed events
  onOrderClaimed(callback: (data: OrderClaimedData) => void) {
    if (this.socket) {
      this.socket.on("order-claimed", callback);
    }
  }

  // Remove order claimed listener
  offOrderClaimed() {
    if (this.socket) {
      this.socket.off("order-claimed");
    }
  }
}

// Export a singleton instance
export const socketService = new SocketService();
