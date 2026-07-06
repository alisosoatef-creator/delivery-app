import { customerHomeMock } from "../customer-home";

describe("customerHomeMock", () => {
  it("centralizes profile payment and support data for the API handoff", () => {
    expect(customerHomeMock.profilePaymentSummary).toEqual({
      method: "فيزا • **** 4242",
      monthlySpend: "184 شيكل",
      status: "فيزا مفعلة"
    });

    expect(customerHomeMock.profileSupport.items).toEqual([
      "محادثة الدعم",
      "الإبلاغ عن مشكلة",
      "مركز المساعدة"
    ]);
    expect(customerHomeMock.profileSupport.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "الإبلاغ عن مشكلة",
          priority: "عالية",
          response: "تم تجهيز نموذج البلاغ لمراجعة المشكلة"
        }),
        expect.objectContaining({
          label: "اتصال سريع",
          priority: "فورية"
        })
      ])
    );
  });
});
