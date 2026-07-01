import request from "supertest";
import app from "../app.js";
 
describe("Metrics API", () => {
  test("GET /metrics should return Prometheus metrics in text format", async () => {
    // Déclenche une première requête pour que le compteur ait un point de données
    await request(app).get("/health");
 
    const response = await request(app).get("/metrics");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/plain/);
    expect(response.text).toContain("foodiespot_http_requests_total");
    expect(response.text).toContain("foodiespot_process_cpu_user_seconds_total"); // métrique par défaut de prom-client
  });
});
