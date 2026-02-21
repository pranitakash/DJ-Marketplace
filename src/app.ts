import express from "express";
import cors from "cors";
import djRoutes from "./routes/dj.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/djs", djRoutes);
app.use("/api/bookings", bookingRoutes);

export default app;