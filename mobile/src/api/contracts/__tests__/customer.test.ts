import { customerHomeMock } from "@/mock/customer-home";

import {
  customerDestinationSchema,
  customerPaymentSummarySchema,
  customerProfileSchema,
  customerSupportActionSchema
} from "../customer";

describe("customer API contracts", () => {
  it("accepts the current customer mock profile, payment, support, and destinations", () => {
    expect(customerProfileSchema.parse(customerHomeMock.profile)).toEqual(customerHomeMock.profile);
    expect(customerPaymentSummarySchema.parse(customerHomeMock.profilePaymentSummary)).toEqual(
      customerHomeMock.profilePaymentSummary
    );
    expect(customerSupportActionSchema.parse(customerHomeMock.profileSupport.actions[1])).toEqual(
      customerHomeMock.profileSupport.actions[1]
    );
    expect(customerDestinationSchema.parse(customerHomeMock.savedPlaces[0])).toMatchObject({
      area: "زواتا",
      distance: "0.0 كم",
      label: "المنزل",
      price: "25 شيكل"
    });
  });
});
