import { customerHomeMock } from "@/mock/customer-home";

export async function getMockCustomerProfile() {
  return customerHomeMock.profile;
}

export async function getMockSupportActions() {
  return customerHomeMock.profileSupport.actions;
}
