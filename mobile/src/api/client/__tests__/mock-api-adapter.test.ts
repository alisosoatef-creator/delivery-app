import { getMockCustomerProfile, getMockSupportActions } from "../mock-api-adapter";

describe("mock API adapter", () => {
  it("returns normalized mock data through API-shaped functions", async () => {
    await expect(getMockCustomerProfile()).resolves.toMatchObject({
      city: "نابلس",
      name: "علي محمد"
    });
    await expect(getMockSupportActions()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "الإبلاغ عن مشكلة",
          priority: "عالية"
        })
      ])
    );
  });
});
