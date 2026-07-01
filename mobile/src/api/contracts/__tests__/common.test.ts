import { apiErrorSchema, apiMetaSchema, apiSuccessSchema } from "../common";

describe("common API contracts", () => {
  it("validates success, error, and pagination metadata", () => {
    expect(apiSuccessSchema.parse({ data: { id: "x" } })).toEqual({ data: { id: "x" } });
    expect(
      apiErrorSchema.parse({
        error: { code: "VALIDATION_ERROR", message: "البيانات غير مكتملة" }
      })
    ).toEqual({
      error: { code: "VALIDATION_ERROR", message: "البيانات غير مكتملة" }
    });
    expect(
      apiMetaSchema.parse({
        page: 1,
        pageSize: 20,
        total: 42
      })
    ).toEqual({
      page: 1,
      pageSize: 20,
      total: 42
    });
  });
});
