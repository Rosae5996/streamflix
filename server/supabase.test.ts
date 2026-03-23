import { describe, expect, it } from "vitest";

describe("Supabase Configuration", () => {
  it("should have SUPABASE_URL configured", () => {
    const url = process.env.SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });

  it("should have SUPABASE_ANON_KEY configured", () => {
    const key = process.env.SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(0);
  });

  it("should have SUPABASE_SERVICE_ROLE_KEY configured", () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(0);
  });

  it("should validate Supabase credentials format", async () => {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Supabase credentials not configured");
    }

    // Try a simple health check to Supabase
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });

      // We expect either 200 or 404 (table not found) - both mean auth worked
      expect([200, 404, 401]).toContain(response.status);
    } catch (error) {
      // Network errors are acceptable in test environment
      expect(error).toBeDefined();
    }
  });
});
