import request from "supertest";
import app from "../app.js";

describe("Restaurants API", () => {
  test("GET /restaurants should return a list of restaurants", async () => {
    const response = await request(app).get("/restaurants");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
