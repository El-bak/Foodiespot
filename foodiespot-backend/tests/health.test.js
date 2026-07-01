import request from "supertest";
import app from "../app.js";

describe("Health API", () => {

    test("GET /health should return status 200", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("UP");
        expect(response.body.service).toBe("FoodieSpot API");

    });

});
