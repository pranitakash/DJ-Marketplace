import request from "supertest";
import app from "../app.js";

describe("API Health Check", () => {
    it("should return a list of DJs", async () => {
        const res = await request(app).get("/api/djs");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("data");
    });

    it("should return 401 for unauthorized bookings access", async () => {
        const res = await request(app).post("/api/bookings").send({});
        expect(res.status).toBe(401);
    });
});
