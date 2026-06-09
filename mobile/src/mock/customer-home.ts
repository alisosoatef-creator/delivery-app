import { Briefcase, Car, Home, MapPin, Navigation, Search, User } from "lucide-react-native";

export const customerHomeMock = {
  customerName: "علي",
  greeting: "أهلًا بك، علي",
  subtitle: "رحلتك القادمة تبدأ من الخريطة",
  nearbyDrivers: "8",
  eta: "3 د",
  suggestedFare: "25 شيكل",
  pickup: "موقعك الحالي",
  destinationHint: "إلى أين وجهتك اليوم؟",
  savedPlaces: [
    {
      label: "المنزل",
      detail: "شارع النخيل، الرياض",
      icon: Home
    },
    {
      label: "العمل",
      detail: "طريق الملك فهد",
      icon: Briefcase
    }
  ],
  service: {
    label: "خدمة واصل",
    meta: "طلب واحد يصل لأقرب كابتن مناسب",
    eta: "3 دقائق",
    price: "25 شيكل"
  },
  navItems: [
    {
      label: "الرئيسية",
      icon: Home,
      active: true
    },
    {
      label: "البحث",
      icon: Search,
      active: false
    },
    {
      label: "رحلاتي",
      icon: Car,
      active: false
    },
    {
      label: "حسابي",
      icon: User,
      active: false
    }
  ],
  mapMarkers: [
    {
      label: "نقطة الانطلاق",
      icon: Navigation
    },
    {
      label: "وجهتك",
      icon: MapPin
    }
  ]
} as const;
