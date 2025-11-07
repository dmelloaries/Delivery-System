import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "./models/user.model.js";
import partnerModel from "./models/partner.model.js";
import orderModel from "./models/order.model.js";

let io;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173", // your React frontend (Vite)
        "http://127.0.0.1:5500", // your local HTML file (Live Server)
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded._id;
      socket.userRole = decoded.role;

      // Update socketId in database
      if (decoded.role === "user") {
        await userModel.findByIdAndUpdate(decoded._id, { socketId: socket.id });
      } else if (decoded.role === "partner") {
        await partnerModel.findByIdAndUpdate(decoded._id, {
          socketId: socket.id,
        });
      }

      next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}, Role: ${socket.userRole}`);

    // Join user to their personal room
    socket.join(`${socket.userRole}-${socket.userId}`);

    // Join order tracking room (for users tracking their orders)
    socket.on("join-order-room", (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`User ${socket.userId} joined order room: ${orderId}`);
    });

    // Leave order tracking room
    socket.on("leave-order-room", (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`User ${socket.userId} left order room: ${orderId}`);
    });

    // Partners can join a general room to listen for new orders
    if (socket.userRole === "partner") {
      socket.join("partners-room");
      console.log(`Partner ${socket.userId} joined partners room`);
    }

    // Handle order locking request
    socket.on("request-order-lock", async (data) => {
      try {
        const { orderId } = data;
        const LOCK_DURATION = 30000; // 30 seconds to accept

        // Find the order
        const order = await orderModel.findById(orderId);

        if (!order) {
          socket.emit("order-lock-failed", {
            orderId,
            message: "Order not found",
          });
          return;
        }

        // Check if order is already claimed or locked by someone else
        if (order.partner && order.status !== "Pending") {
          socket.emit("order-lock-failed", {
            orderId,
            message: "Order already accepted by another partner",
          });
          return;
        }

        // Check if order is locked by another partner
        if (
          order.isLocked &&
          order.lockedBy &&
          order.lockedBy.toString() !== socket.userId &&
          order.lockExpiry > new Date()
        ) {
          socket.emit("order-lock-failed", {
            orderId,
            message: "Order is currently being reviewed by another partner",
          });
          return;
        }

        // Lock the order
        order.isLocked = true;
        order.lockedBy = socket.userId;
        order.lockedAt = new Date();
        order.lockExpiry = new Date(Date.now() + LOCK_DURATION);
        await order.save();

        // Notify the partner who locked the order
        socket.emit("order-locked", {
          orderId,
          lockExpiry: order.lockExpiry,
          message: "Order locked for 30 seconds. Please accept or decline.",
        });

        // Notify other partners that this order is temporarily unavailable
        socket.to("partners-room").emit("order-temporarily-locked", {
          orderId,
          lockedBy: socket.userId,
        });

        // Set timeout to release lock if not accepted
        setTimeout(async () => {
          const lockedOrder = await orderModel.findById(orderId);
          if (
            lockedOrder &&
            lockedOrder.isLocked &&
            lockedOrder.status === "Pending" &&
            lockedOrder.lockedBy.toString() === socket.userId
          ) {
            lockedOrder.isLocked = false;
            lockedOrder.lockedBy = null;
            lockedOrder.lockedAt = null;
            lockedOrder.lockExpiry = null;
            await lockedOrder.save();

            socket.emit("order-lock-expired", { orderId });
            io.to("partners-room").emit("order-lock-released", { orderId });
          }
        }, LOCK_DURATION);
      } catch (error) {
        console.error("Error locking order:", error);
        socket.emit("order-lock-failed", {
          orderId: data.orderId,
          message: "Failed to lock order",
        });
      }
    });

    // Handle order acceptance confirmation
    socket.on("confirm-order-acceptance", async (data) => {
      try {
        const { orderId } = data;

        const order = await orderModel.findById(orderId);

        if (!order) {
          socket.emit("order-acceptance-failed", {
            orderId,
            message: "Order not found",
          });
          return;
        }

        // Verify the partner has the lock
        if (
          !order.isLocked ||
          order.lockedBy.toString() !== socket.userId ||
          order.lockExpiry < new Date()
        ) {
          socket.emit("order-acceptance-failed", {
            orderId,
            message: "Lock expired or invalid",
          });
          return;
        }

        // Update order
        order.partner = socket.userId;
        order.status = "Accepted";
        order.isLocked = false;
        order.lockedBy = null;
        order.lockedAt = null;
        order.lockExpiry = null;
        await order.save();

        // Notify the accepting partner
        socket.emit("order-accepted-success", {
          orderId,
          message: "Order accepted successfully",
        });

        // Notify the customer
        io.to(`order-${orderId}`).emit("order-status-update", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          partner: socket.userId,
          message: "Your order has been accepted by a partner",
          timestamp: new Date(),
        });

        // Notify other partners
        socket.to("partners-room").emit("order-claimed", {
          orderId,
          partnerId: socket.userId,
        });
      } catch (error) {
        console.error("Error accepting order:", error);
        socket.emit("order-acceptance-failed", {
          orderId: data.orderId,
          message: "Failed to accept order",
        });
      }
    });

    // Handle order decline
    socket.on("decline-order", async (data) => {
      try {
        const { orderId } = data;

        const order = await orderModel.findById(orderId);

        if (!order) {
          return;
        }

        // Release lock if this partner has it
        if (
          order.isLocked &&
          order.lockedBy &&
          order.lockedBy.toString() === socket.userId
        ) {
          order.isLocked = false;
          order.lockedBy = null;
          order.lockedAt = null;
          order.lockExpiry = null;
          await order.save();

          socket.emit("order-declined", { orderId });
          io.to("partners-room").emit("order-lock-released", { orderId });
        }
      } catch (error) {
        console.error("Error declining order:", error);
      }
    });

    // Handle partner location updates (for real-time tracking)
    socket.on("partner-location-update", async (data) => {
      try {
        const { orderId, location } = data;

        // Broadcast location to users tracking this order
        socket.to(`order-${orderId}`).emit("partner-location", {
          orderId,
          location,
          partnerId: socket.userId,
          timestamp: new Date(),
        });

        // Also broadcast to user's personal room
        const order = await orderModel.findById(orderId);
        if (order) {
          io.to(`user-${order.user}`).emit("partner-location", {
            orderId,
            location,
            partnerId: socket.userId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error updating partner location:", error);
      }
    });

    // Handle typing/status indicators
    socket.on("typing", (data) => {
      socket.to(`order-${data.orderId}`).emit("user-typing", {
        userId: socket.userId,
        orderId: data.orderId,
      });
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);

      // Clear socketId from database
      try {
        if (socket.userRole === "user") {
          await userModel.findByIdAndUpdate(socket.userId, { socketId: null });
        } else if (socket.userRole === "partner") {
          await partnerModel.findByIdAndUpdate(socket.userId, {
            socketId: null,
          });
        }
      } catch (err) {
        console.error("Error clearing socketId:", err);
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Helper functions to emit events
export const emitNewOrder = (orderData) => {
  if (io) {
    io.to("partners-room").emit("new-order", {
      ...orderData,
      timestamp: new Date(),
      message: "New order available!",
    });
  }
};

export const emitOrderStatusUpdate = (orderId, userId, statusData) => {
  if (io) {
    // Emit to the order room
    io.to(`order-${orderId}`).emit("order-status-update", {
      ...statusData,
      orderId,
      timestamp: new Date(),
    });

    // Also emit to user's personal room
    if (userId) {
      io.to(`user-${userId}`).emit("order-status-update", {
        ...statusData,
        orderId,
        timestamp: new Date(),
      });
    }
  }
};

export const emitOrderClaimed = (orderData) => {
  if (io) {
    // Notify all partners that order is no longer available
    io.to("partners-room").emit("order-claimed", {
      ...orderData,
      timestamp: new Date(),
    });
  }
};

export const emitOrderCancelled = (partnerId, userId, orderData) => {
  if (io) {
    // Notify the partner
    if (partnerId) {
      io.to(`partner-${partnerId}`).emit("order-cancelled", {
        ...orderData,
        timestamp: new Date(),
        message: "Order has been cancelled by the customer",
      });
    }

    // Notify the user
    if (userId) {
      io.to(`user-${userId}`).emit("order-cancelled", {
        ...orderData,
        timestamp: new Date(),
        message: "Your order has been cancelled",
      });
    }
  }
};

export const emitPartnerStatusUpdate = (orderId, userId, statusData) => {
  if (io) {
    // Real-time status updates for customers
    io.to(`order-${orderId}`).emit("delivery-status-update", {
      ...statusData,
      orderId,
      timestamp: new Date(),
    });

    if (userId) {
      io.to(`user-${userId}`).emit("delivery-status-update", {
        ...statusData,
        orderId,
        timestamp: new Date(),
      });
    }
  }
};

export default {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitOrderClaimed,
  emitOrderCancelled,
  emitPartnerStatusUpdate,
};
