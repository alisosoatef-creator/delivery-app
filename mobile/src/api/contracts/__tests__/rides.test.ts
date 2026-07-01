import { captainHomeMock } from "@/mock/captain-home";

import { captainAvailableRequestSchema, rideStatusSchema } from "../rides";

describe("ride API contracts", () => {
  it("accepts the current captain request mock and ride statuses", () => {
    expect(captainAvailableRequestSchema.parse(captainHomeMock.availableRequests[0])).toEqual(
      captainHomeMock.availableRequests[0]
    );
    expect(rideStatusSchema.parse("pickup")).toBe("pickup");
    expect(rideStatusSchema.parse("arrived")).toBe("arrived");
    expect(rideStatusSchema.parse("driving")).toBe("driving");
    expect(rideStatusSchema.parse("completed")).toBe("completed");
  });
});
