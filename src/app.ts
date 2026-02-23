import express from "express";
import cors from "cors";
import djRoutes from "./routes/dj.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { setupSwagger } from "./swagger.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(globalLimiter);

app.use("/api/djs", djRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);
setupSwagger(app);
export default app;