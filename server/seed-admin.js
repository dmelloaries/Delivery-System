import "dotenv/config";
import mongoose from "mongoose";
import adminModel from "./models/admin.model.js";

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({
      email: "admin@gmail.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await adminModel.hashPassword("admin123");

    const admin = await adminModel.create({
      fullname: {
        firstname: "Admin",
        lastname: "User",
      },
      email: "admin@gmail.com",
      password: hashedPassword,
    });

    console.log("Admin user created successfully:");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin123");
    

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
