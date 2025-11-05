import mongoose from "mongoose";

const deliveryStatusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "partner",
  },
  
  status: {
    type: String,
    enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
    default: "pending",
  },


  paymentID: {
    type: String,
  },
  orderId: {
    type: String,
  },
  

  
});

module.exports = mongoose.model("deliveryStatus", deliveryStatusSchema);
