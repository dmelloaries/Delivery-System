import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import userModel from "./models/user.model.js";
import partnerModel from "./models/partner.model.js";

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

    // Handle partner location updates (for real-time tracking)
    socket.on("partner-location-update", (data) => {
      const { orderId, location } = data;
      // Broadcast location to users tracking this order
      socket.to(`order-${orderId}`).emit("partner-location", {
        orderId,
        location,
        partnerId: socket.userId,
      });
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
    io.to("partners-room").emit("new-order", orderData);
  }
};

export const emitOrderStatusUpdate = (orderId, statusData) => {
  if (io) {
    io.to(`order-${orderId}`).emit("order-status-update", statusData);
  }
};

export const emitOrderClaimed = (orderData) => {
  if (io) {
    io.emit("order-claimed", orderData);
  }
};

export const emitOrderCancelled = (partnerId, orderData) => {
  if (io) {
    io.to(`partner-${partnerId}`).emit("order-cancelled", orderData);
  }
};

export default {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitOrderClaimed,
  emitOrderCancelled,
};
