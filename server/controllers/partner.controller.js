import partnerModel from "../models/partner.model.js";
import orderModel from "../models/order.model.js";
import blacklistTokenModel from "../models/BlacklistToken.model.js";
import {
  registerPartnerSchema,
  loginPartnerSchema,
} from "../validations/partner.validation.js";
import { updateOrderStatusSchema } from "../validations/order.validation.js";

export const registerPartner = async (req, res) => {
  try {
    const validation = registerPartnerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { fullname, email, password } = validation.data;

    const existingPartner = await partnerModel.findOne({ email });

    if (existingPartner) {
      return res.status(400).json({ message: "Partner already exists" });
    }

    const hashedPassword = await partnerModel.hashPassword(password);

    const partner = await partnerModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = partner.generateAuthToken();

    res.status(201).json({
      token,
      partner: {
        _id: partner._id,
        fullname: partner.fullname,
        email: partner.email,
        status: partner.status,
      },
    });
  } catch (err) {
    console.error("Register partner error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginPartner = async (req, res) => {
  try {
    const validation = loginPartnerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { email, password } = validation.data;

    const partner = await partnerModel.findOne({ email }).select("+password");

    if (!partner) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!partner.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated" });
    }

    const isMatch = await partner.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = partner.generateAuthToken();

    res.json({
      token,
      partner: {
        _id: partner._id,
        fullname: partner.fullname,
        email: partner.email,
        status: partner.status,
      },
    });
  } catch (err) {
    console.error("Login partner error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getPartnerProfile = async (req, res) => {
  try {
    res.json({
      partner: {
        _id: req.partner._id,
        fullname: req.partner.fullname,
        email: req.partner.email,
        status: req.partner.status,
        isActive: req.partner.isActive,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutPartner = async (req, res) => {
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

// Order Management for Partners
export const getUnclaimedOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        status: "Pending",
        partner: null,
      })
      .populate("user", "fullname email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Get unclaimed orders error:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export const claimOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel
      .findOne({
        _id: orderId,
        status: "Pending",
        partner: null,
      })
      .populate("user", "fullname email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found or already claimed",
      });
    }

    // Check if order is locked by another partner
    if (
      order.isLocked &&
      order.lockedBy &&
      order.lockedBy.toString() !== req.partner._id.toString() &&
      order.lockExpiry > new Date()
    ) {
      return res.status(409).json({
        message: "Order is currently being reviewed by another partner",
        lockedUntil: order.lockExpiry,
      });
    }

    // Claim the order
    order.partner = req.partner._id;
    order.status = "Accepted";
    order.isLocked = false;
    order.lockedBy = null;
    order.lockedAt = null;
    order.lockExpiry = null;
    await order.save();

    // Update partner status to active
    if (req.partner.status === "inactive") {
      req.partner.status = "active";
      await req.partner.save();
    }

    // Emit socket events
    if (req.io) {
      // Notify the customer
      req.io.to(`order-${order._id}`).emit("order-status-update", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        partner: {
          _id: req.partner._id,
          fullname: req.partner.fullname,
        },
        message: "Your order has been accepted by a partner",
        timestamp: new Date(),
      });

      req.io.to(`user-${order.user._id}`).emit("order-status-update", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        partner: {
          _id: req.partner._id,
          fullname: req.partner.fullname,
        },
        message:
          "Your order has been accepted! Partner is preparing your order.",
        timestamp: new Date(),
      });

      // Notify all partners that order is claimed
      req.io.to("partners-room").emit("order-claimed", {
        orderId: order._id,
        partnerId: req.partner._id,
        timestamp: new Date(),
      });
    }

    res.json({
      message: "Order claimed successfully",
      order,
    });
  } catch (err) {
    console.error("Claim order error:", err);
    res.status(500).json({ message: "Server error while claiming order" });
  }
};

export const getPartnerOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { partner: req.partner._id };

    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await orderModel
      .find(filter)
      .populate("user", "fullname email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Get partner orders error:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const validation = updateOrderStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { orderId } = req.params;
    const { status } = validation.data;

    const order = await orderModel.findOne({
      _id: orderId,
      partner: req.partner._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you don't have permission to update it",
      });
    }

    // Validate status transition
    const validTransitions = {
      Accepted: ["On The Way", "Cancelled"],
      "On The Way": ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    // Update partner status if order is delivered
    if (status === "Delivered") {
      const activeOrders = await orderModel.countDocuments({
        partner: req.partner._id,
        status: { $in: ["Accepted", "On The Way"] },
      });

      if (activeOrders === 0) {
        req.partner.status = "inactive";
        await req.partner.save();
      }

      // Mark payment as completed
      order.paymentStatus = "Completed";
      await order.save();
    }

    // Emit socket events with detailed information
    if (req.io) {
      const statusMessages = {
        "On The Way":
          "Great news! Your order is on the way and will arrive soon!",
        Delivered:
          "Your order has been delivered successfully. Enjoy your meal!",
        Cancelled: "Your order has been cancelled by the partner.",
      };

      // Notify the customer in order room
      req.io.to(`order-${order._id}`).emit("order-status-update", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        message: statusMessages[status] || `Your order is now ${status}`,
        timestamp: new Date(),
      });

      // Notify customer in their personal room
      req.io.to(`user-${order.user}`).emit("order-status-update", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        message: statusMessages[status] || `Your order is now ${status}`,
        timestamp: new Date(),
      });

      // If delivered, send a special completion notification
      if (status === "Delivered") {
        req.io.to(`user-${order.user}`).emit("order-delivered", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          message: "Thank you for your order! We hope you enjoy it!",
          timestamp: new Date(),
        });
      }
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error while updating order" });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel
      .findOne({
        _id: orderId,
        partner: req.partner._id,
      })
      .populate("user", "fullname email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({ message: "Server error while fetching order" });
  }
};

export default {
  registerPartner,
  loginPartner,
  getPartnerProfile,
  logoutPartner,
  getUnclaimedOrders,
  claimOrder,
  getPartnerOrders,
  updateOrderStatus,
  getOrderDetails,
};
