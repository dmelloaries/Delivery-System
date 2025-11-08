import "dotenv/config";
import http from "http";
import app, { setupRoutes } from "./app.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO 
const io = initSocket(server);

// Setup routes with io instance 
setupRoutes(io);

server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`Socket.IO server is ready`);
  
});
