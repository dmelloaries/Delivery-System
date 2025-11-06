import express from "express";
import userController from "../controllers/user.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authentication routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", authUser, userController.getUserProfile);
router.get("/logout", authUser, userController.logoutUser);

// Order routes
router.post("/orders", authUser, userController.createOrder);
router.get("/orders", authUser, userController.getUserOrders);
router.get("/orders/:orderId", authUser, userController.getOrderById);
router.patch("/orders/:orderId/cancel", authUser, userController.cancelOrder);

export default router;
