import express from "express";
import adminController from "../controllers/admin.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authentication routes
router.post("/login", adminController.loginAdmin);
router.get("/profile", authAdmin, adminController.getAdminProfile);
router.get("/logout", authAdmin, adminController.logoutAdmin);

// User management
router.get("/users", authAdmin, adminController.getAllUsers);

// Partner management
router.get("/partners", authAdmin, adminController.getAllPartners);

// Order management
router.get("/orders", authAdmin, adminController.getAllOrders);

// Dashboard stats
router.get("/dashboard/stats", authAdmin, adminController.getDashboardStats);

// Account management
router.patch(
  "/accounts/deactivate",
  authAdmin,
  adminController.deactivateAccount
);
router.patch(
  "/accounts/reactivate",
  authAdmin,
  adminController.reactivateAccount
);
router.delete("/accounts/delete", authAdmin, adminController.deleteAccount);

export default router;
