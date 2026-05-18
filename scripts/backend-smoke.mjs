import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT || 3101);
const baseUrl = `http://127.0.0.1:${port}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 8000) {
    try {
      const health = await request("/api/health");
      if (health.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("Backend smoke server did not become ready");
}

const child = spawn(process.execPath, ["backend/server.mjs"], {
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"]
});

let logs = "";
child.stdout.on("data", (chunk) => {
  logs += chunk;
});
child.stderr.on("data", (chunk) => {
  logs += chunk;
});

try {
  await waitForServer();

  const bootstrap = await request("/api/bootstrap");
  assert(Array.isArray(bootstrap.cities), "bootstrap should include cities");
  assert(Array.isArray(bootstrap.pricingRules), "bootstrap should include pricingRules");
  assert(bootstrap.settings?.appStatus, "bootstrap should include active settings");

  const phone = `+97059000${Date.now().toString().slice(-4)}`;
  const register = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName: "Smoke Customer", phone, password: "demo123", cityId: "nablus" })
  });
  assert(register.requestId, "register should return requestId");

  const verified = await request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ requestId: register.requestId, code: "1234" })
  });
  assert(verified.user?.verified, "verify-otp should mark user verified");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: phone, password: "demo123" })
  });
  assert(login.token, "login should return token");

  const applicationResponse = await request("/api/captain-applications", {
    method: "POST",
    body: JSON.stringify({
      fullName: "Smoke Captain",
      phone: "+970599999999",
      city: "nablus",
      age: 31,
      vehicleType: "car",
      vehiclePlate: "SMK-1"
    })
  });
  const applicationId = applicationResponse.application?.id;
  assert(applicationId, "captain application should return id");

  const approve = await request(`/api/admin/captain-applications/${applicationId}/approve`, { method: "PATCH" });
  assert(approve.application.status === "approved", "approve should update application status");
  assert(approve.captain?.applicationId === applicationId, "approve should create approved captain");

  const quote = await request("/api/rides/quote", {
    method: "POST",
    body: JSON.stringify({ cityId: "nablus", distanceKm: 5.8 })
  });
  assert(quote.fareIls, "quote should include fareIls");

  const ride = await request("/api/rides", {
    method: "POST",
    body: JSON.stringify({ cityId: "nablus", pickup: "A", dropoff: "B", paymentMethod: "cash", distanceKm: 5.8 })
  });
  assert(ride.ride?.id, "ride request should create ride");

  const status = await request(`/api/rides/${ride.ride.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" })
  });
  assert(status.ride.status === "completed", "ride status should update");

  const ticket = await request("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify({ userName: "Smoke Customer", type: "general", message: "Need help" })
  });
  assert(ticket.ticket?.status === "open", "support ticket should start open");

  const pricing = await request("/api/admin/pricing/nablus", {
    method: "PATCH",
    body: JSON.stringify({ baseFareIls: 13 })
  });
  assert(pricing.rule.baseFareIls === 13, "pricing patch should update base fare");

  console.log("backend-smoke-ok");
} finally {
  child.kill();
  setTimeout(() => child.kill("SIGKILL"), 500).unref();
}

child.on("exit", (code) => {
  if (code && code !== 0 && !logs.includes("Wasel API listening")) {
    console.error(logs);
  }
});
