import mongoose from "mongoose";

const deliveryStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "partner",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "On The Way", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentID: {
      type: String,
    },
    orderId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const deliveryStatusModel = mongoose.model(
  "deliveryStatus",
  deliveryStatusSchema
);

export default deliveryStatusModel;
