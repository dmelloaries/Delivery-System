import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "partner",
      default: null,
    },
    items: [
      {
        id: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        image: String,
        category: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "On The Way", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    // Order locking fields
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "partner",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    lockExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
