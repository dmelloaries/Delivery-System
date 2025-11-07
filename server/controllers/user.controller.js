import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import blacklistTokenModel from "../models/BlacklistToken.model.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validations/user.validation.js";
import { createOrderSchema } from "../validations/order.validation.js";

export const registerUser = async (req, res) => {
  try {
    const validation = registerUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { fullname, email, password } = validation.data;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const validation = loginUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { email, password } = validation.data;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        fullname: req.user.fullname,
        email: req.user.email,
        isActive: req.user.isActive,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await blacklistTokenModel.create({ token });
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// Order Management for Users
export const createOrder = async (req, res) => {
  try {
    const validation = createOrderSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { items, totalAmount, deliveryAddress, phone } = validation.data;

    const order = await orderModel.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      phone,
      status: "Pending",
    });

    // Populate order for socket emission
    await order.populate("user", "fullname email");

    // Emit socket event for new order to all partners
    if (req.io) {
      req.io.to("partners-room").emit("new-order", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items,
        user: {
          _id: order.user._id,
          fullname: order.user.fullname,
        },
        createdAt: order.createdAt,
        timestamp: new Date(),
        message: "New order available!",
      });

      // Notify the user that order is created and waiting for partner
      req.io.to(`user-${req.user._id}`).emit("order-created", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        message: "Order created successfully. Waiting for partner to accept...",
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .populate("partner", "fullname email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel
      .findOne({ _id: orderId, user: req.user._id })
      .populate("partner", "fullname email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Server error while fetching order" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending" && order.status !== "Accepted") {
      return res.status(400).json({
        message:
          "Cannot cancel order. It's already being processed or delivered",
      });
    }

    order.status = "Cancelled";
    await order.save();

    // Emit socket event for order cancellation
    if (req.io) {
      // Notify user
      req.io.to(`order-${order._id}`).emit("order-status-update", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        message: "Order has been cancelled",
        timestamp: new Date(),
      });

      req.io.to(`user-${req.user._id}`).emit("order-cancelled", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        message: "Your order has been cancelled successfully",
        timestamp: new Date(),
      });

      // Notify partner if assigned
      if (order.partner) {
        req.io.to(`partner-${order.partner}`).emit("order-cancelled", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          message: "Order has been cancelled by the customer",
          timestamp: new Date(),
        });
      }
    }

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
};
