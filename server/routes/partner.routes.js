import express from "express";
import partnerController from "../controllers/partner.controller.js";
import { authPartner } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authentication routes
router.post("/register", partnerController.registerPartner);
router.post("/login", partnerController.loginPartner);
router.get("/profile", authPartner, partnerController.getPartnerProfile);
router.get("/logout", authPartner, partnerController.logoutPartner);

// Order routes
router.get(
  "/orders/unclaimed",
  authPartner,
  partnerController.getUnclaimedOrders
);
router.post(
  "/orders/:orderId/claim",
  authPartner,
  partnerController.claimOrder
);
router.get("/orders", authPartner, partnerController.getPartnerOrders);
router.get("/orders/:orderId", authPartner, partnerController.getOrderDetails);
router.patch(
  "/orders/:orderId/status",
  authPartner,
  partnerController.updateOrderStatus
);

export default router;
