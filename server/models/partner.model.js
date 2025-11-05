import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { jwt } from "jsonwebtoken";

const partnerSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, "Firstname must be at least 3 characters long"],
    },
    lastname: {
      type: String,
      minlength: [3, "Lastname must be at least 3 characters long"],
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  socketId: {
    type: String,
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
});

partnerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

partnerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

partnerSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const partnerModel = mongoose.model("partner", partnerSchema);

module.exports = partnerModel;
