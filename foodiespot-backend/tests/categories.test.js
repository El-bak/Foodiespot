import request from "supertest";
import app from "../app.js";

describe("Categories API", () => {
  test("GET /categories should return a list of categories", async () => {
    const response = await request(app).get("/categories");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
