import app from "./app.js";
import http from "http";
import { initSocket } from "./socket.js";
import dotenv from "dotenv";
dotenv.config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});