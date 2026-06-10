export const captainHomeMock = {
  captainName: "أحمد",
  appLabel: "تطبيق الكابتن",
  greeting: "أهلًا كابتن أحمد",
  onlineLabel: "متصل",
  offlineLabel: "غير متصل",
  metrics: {
    earningsToday: "620 شيكل",
    tripsToday: "24",
    rating: "4.9"
  },
  earnings: {
    title: "أرباح الكابتن",
    todayLabel: "إجمالي أرباح اليوم",
    todayTotal: "620 شيكل",
    completedTrips: "24 رحلة مكتملة",
    lastPayoutLabel: "آخر دفعة",
    lastPayout: "420 شيكل",
    weeklyLabel: "نشاط الأسبوع",
    weeklyBars: ["40", "85", "60", "110", "72", "130", "95"],
    withdrawLabel: "سحب الأرباح",
    withdrawNotice: "طلب السحب mock فقط الآن"
  },
  profile: {
    title: "حساب الكابتن",
    name: "كابتن أحمد",
    phone: "+970 59 555 1212",
    vehicle: "تويوتا كورولا - أبيض",
    plate: "12-345-67",
    status: "موثق وجاهز لاستقبال الطلبات"
  },
  availableRequests: [
    {
      id: "request-001",
      customerName: "علي محمد",
      customerPhone: "+970 59 111 2222",
      pickup: "زواتا",
      destinationArea: "نابلس - رفيديا",
      destinationDetail: "مطعم شورما عكيفك",
      distance: "2.4 كم",
      price: "25 شيكل",
      paymentMethod: "كاش عند الاستلام",
      etaToPickup: "3 د"
    }
  ]
} as const;

export type CaptainAvailableRequest = (typeof captainHomeMock.availableRequests)[number];
