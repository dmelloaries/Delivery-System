import adminModel from "../models/admin.model.js";
import userModel from "../models/user.model.js";
import partnerModel from "../models/partner.model.js";
import orderModel from "../models/order.model.js";
import blacklistTokenModel from "../models/BlacklistToken.model.js";
import {
  loginAdminSchema,
  deactivateAccountSchema,
} from "../validations/admin.validation.js";

export const loginAdmin = async (req, res) => {
  try {
    const validation = loginAdminSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { email, password } = validation.data;

    const admin = await adminModel.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = admin.generateAuthToken();

    res.json({
      token,
      admin: {
        _id: admin._id,
        fullname: admin.fullname,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    res.json({
      admin: {
        _id: req.admin._id,
        fullname: req.admin.fullname,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (err) {
    console.error("Get admin profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutAdmin = async (req, res) => {
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

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", isActive } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { "fullname.firstname": { $regex: search, $options: "i" } },
        { "fullname.lastname": { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const users = await userModel
      .find(filter)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await userModel.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// Partner Management
export const getAllPartners = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status, isActive } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { "fullname.firstname": { $regex: search, $options: "i" } },
        { "fullname.lastname": { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const partners = await partnerModel
      .find(filter)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await partnerModel.countDocuments(filter);

    res.json({
      partners,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error("Get partners error:", err);
    res.status(500).json({ message: "Server error while fetching partners" });
  }
};

// Order Management
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId, partnerId } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (userId) {
      filter.user = userId;
    }

    if (partnerId) {
      filter.partner = partnerId;
    }

    const orders = await orderModel
      .find(filter)
      .populate("user", "fullname email")
      .populate("partner", "fullname email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await orderModel.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// Platform Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPartners,
      activePartners,
      totalOrders,
      pendingOrders,
      acceptedOrders,
      onTheWayOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      userModel.countDocuments({ isActive: true }),
      userModel.countDocuments({ isActive: true }),
      partnerModel.countDocuments({ isActive: true }),
      partnerModel.countDocuments({ status: "active", isActive: true }),
      orderModel.countDocuments(),
      orderModel.countDocuments({ status: "Pending" }),
      orderModel.countDocuments({ status: "Accepted" }),
      orderModel.countDocuments({ status: "On The Way" }),
      orderModel.countDocuments({ status: "Delivered" }),
      orderModel.countDocuments({ status: "Cancelled" }),
    ]);

    // Calculate total revenue (from delivered orders)
    const revenueData = await orderModel.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Recent orders
    const recentOrders = await orderModel
      .find()
      .populate("user", "fullname email")
      .populate("partner", "fullname email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        partners: {
          total: totalPartners,
          active: activePartners,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          accepted: acceptedOrders,
          onTheWay: onTheWayOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          total: totalRevenue,
        },
      },
      recentOrders,
    });
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};

// Account Management
export const deactivateAccount = async (req, res) => {
  try {
    const validation = deactivateAccountSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { userId, partnerId } = validation.data;

    if (userId) {
      const user = await userModel.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        message: "User account deactivated successfully",
        user,
      });
    }

    if (partnerId) {
      const partner = await partnerModel.findByIdAndUpdate(
        partnerId,
        { isActive: false },
        { new: true }
      );

      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }

      return res.json({
        message: "Partner account deactivated successfully",
        partner,
      });
    }
  } catch (err) {
    console.error("Deactivate account error:", err);
    res
      .status(500)
      .json({ message: "Server error while deactivating account" });
  }
};

export const reactivateAccount = async (req, res) => {
  try {
    const validation = deactivateAccountSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { userId, partnerId } = validation.data;

    if (userId) {
      const user = await userModel.findByIdAndUpdate(
        userId,
        { isActive: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        message: "User account reactivated successfully",
        user,
      });
    }

    if (partnerId) {
      const partner = await partnerModel.findByIdAndUpdate(
        partnerId,
        { isActive: true },
        { new: true }
      );

      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }

      return res.json({
        message: "Partner account reactivated successfully",
        partner,
      });
    }
  } catch (err) {
    console.error("Reactivate account error:", err);
    res
      .status(500)
      .json({ message: "Server error while reactivating account" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const validation = deactivateAccountSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { userId, partnerId } = validation.data;

    if (userId) {
      // Check if user has active orders
      const activeOrders = await orderModel.countDocuments({
        user: userId,
        status: { $in: ["Pending", "Accepted", "On The Way"] },
      });

      if (activeOrders > 0) {
        return res.status(400).json({
          message: "Cannot delete user with active orders",
        });
      }

      await userModel.findByIdAndDelete(userId);

      return res.json({
        message: "User account deleted successfully",
      });
    }

    if (partnerId) {
      // Check if partner has active orders
      const activeOrders = await orderModel.countDocuments({
        partner: partnerId,
        status: { $in: ["Accepted", "On The Way"] },
      });

      if (activeOrders > 0) {
        return res.status(400).json({
          message: "Cannot delete partner with active orders",
        });
      }

      await partnerModel.findByIdAndDelete(partnerId);

      return res.json({
        message: "Partner account deleted successfully",
      });
    }
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
};

export default {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
  getAllUsers,
  getAllPartners,
  getAllOrders,
  getDashboardStats,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
};
