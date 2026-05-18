export const mockCustomers = [
  { id: "cust_001", name: "ليان سمارة", phone: "+970 59 111 2200", city: "Nablus", trips: 18, status: "active" },
  { id: "cust_002", name: "Omar Khalil", phone: "+970 59 221 3100", city: "Ramallah", trips: 9, status: "active" },
  { id: "cust_003", name: "سارة عودة", phone: "+970 59 411 8800", city: "Hebron", trips: 4, status: "suspended" }
];

export const mockRideRecords = [
  {
    id: "ride_9001",
    customer: "ليان سمارة",
    captain: "Ahmad Naser",
    pickup: "جامعة النجاح",
    dropoff: "رفيديا",
    fareIls: 24,
    paymentMethod: "cash",
    status: "completed",
    time: "09:45"
  },
  {
    id: "ride_9002",
    customer: "Omar Khalil",
    captain: "Pending captain acceptance",
    pickup: "المنارة",
    dropoff: "بيرزيت",
    fareIls: 31,
    paymentMethod: "visa",
    status: "searching",
    time: "11:20"
  },
  {
    id: "ride_9003",
    customer: "سارة عودة",
    captain: "Laith Odeh",
    pickup: "وسط المدينة",
    dropoff: "الخليل الجديدة",
    fareIls: 28,
    paymentMethod: "cash",
    status: "accepted",
    time: "12:10"
  }
];

export const mockPaymentRecords = [
  { id: "pay_001", method: "cash", amountIls: 24, status: "collected", rideId: "ride_9001" },
  { id: "pay_002", method: "visa", amountIls: 31, status: "placeholder", rideId: "ride_9002" },
  { id: "pay_003", method: "cash", amountIls: 28, status: "pending", rideId: "ride_9003" }
];

export const adminPermissionRoles = [
  { role: "Owner", scope: "Full product, billing, approvals, permissions", status: "Placeholder" },
  { role: "Admin", scope: "Operations dashboard, captain approvals, pricing", status: "Placeholder" },
  { role: "Support", scope: "Tickets, customer contact, issue notes", status: "Placeholder" },
  { role: "Operations", scope: "Rides, captains, demand and city operations", status: "Placeholder" }
];
