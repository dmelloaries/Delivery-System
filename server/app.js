import express from "express";
import cors from "cors";
import ConnectToDb from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

ConnectToDb();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is alive");

  console.log("endpiint hiyt");
});

app.use("/users", userRoutes);
app.use("/partner", partnerRoutes);
app.use("/rides", deliveryRoutes);
app.use("/admin", adminRoutes);

export default app;
