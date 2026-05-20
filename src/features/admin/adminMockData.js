export const mockCustomers = [
  { id: "cust_001", name: "ليان سمارة", phone: "+970 59 111 2200", city: "Nablus", trips: 18, status: "active", isVerified: true },
  { id: "cust_002", name: "Omar Khalil", phone: "+970 59 221 3100", city: "Ramallah", trips: 9, status: "active", isVerified: true },
  { id: "cust_003", name: "سارة عودة", phone: "+970 59 411 8800", city: "Hebron", trips: 4, status: "suspended", isVerified: false }
];

export const mockRideRecords = [
  {
    id: "ride_9001",
    customer: "ليان سمارة",
    customerPhone: "+970 59 111 2200",
    captain: "Ahmad Naser",
    pickup: "جامعة النجاح",
    dropoff: "رفيديا",
    city: "Nablus",
    distanceKm: 6.4,
    durationMinutes: 14,
    fareIls: 24,
    paymentMethod: "cash",
    paymentStatus: "paid",
    status: "completed",
    time: "09:45",
    createdAt: "2026-05-20T09:45:00.000Z",
    acceptedAt: "2026-05-20T09:48:00.000Z",
    completedAt: "2026-05-20T10:05:00.000Z"
  },
  {
    id: "ride_9002",
    customer: "Omar Khalil",
    customerPhone: "+970 59 221 3100",
    captain: "Pending captain acceptance",
    pickup: "المنارة",
    dropoff: "بيرزيت",
    city: "Ramallah",
    distanceKm: 9.2,
    durationMinutes: 18,
    fareIls: 31,
    paymentMethod: "visa",
    paymentStatus: "pending",
    status: "searching",
    time: "11:20",
    createdAt: "2026-05-20T11:20:00.000Z"
  },
  {
    id: "ride_9003",
    customer: "سارة عودة",
    customerPhone: "+970 59 411 8800",
    captain: "Laith Odeh",
    pickup: "وسط المدينة",
    dropoff: "الخليل الجديدة",
    city: "Hebron",
    distanceKm: 7.1,
    durationMinutes: 16,
    fareIls: 28,
    paymentMethod: "cash",
    paymentStatus: "pending",
    status: "accepted",
    time: "12:10",
    createdAt: "2026-05-20T12:10:00.000Z",
    acceptedAt: "2026-05-20T12:13:00.000Z"
  }
];

export const mockPaymentRecords = [
  { id: "pay_001", method: "cash", amountIls: 24, status: "paid", rideId: "ride_9001", customerName: "ليان سمارة", driverName: "Ahmad Naser", provider: "cash/manual", createdAt: "2026-05-20T10:05:00.000Z" },
  { id: "pay_002", method: "visa", amountIls: 31, status: "pending", rideId: "ride_9002", customerName: "Omar Khalil", driverName: "-", provider: "visa-placeholder", createdAt: "2026-05-20T11:20:00.000Z" },
  { id: "pay_003", method: "cash", amountIls: 28, status: "pending", rideId: "ride_9003", customerName: "سارة عودة", driverName: "Laith Odeh", provider: "cash/manual", createdAt: "2026-05-20T12:10:00.000Z" }
];

export const adminPermissionRoles = [
  { role: "Owner", scope: "Full product, billing, approvals, permissions", status: "Placeholder" },
  { role: "Admin", scope: "Control dashboard, captain approvals, pricing", status: "Placeholder" },
  { role: "Support", scope: "Tickets, customer contact, issue notes", status: "Placeholder" }
];
