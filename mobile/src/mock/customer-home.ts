import { Briefcase, Car, Home, MapPin, Navigation, Search, User } from "lucide-react-native";

export const customerHomeMock = {
  customerName: "علي",
  greeting: "أهلًا بك، علي",
  subtitle: "رحلتك القادمة تبدأ من الخريطة",
  nearbyDrivers: "8",
  eta: "3 د",
  suggestedFare: "25 ر.س",
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
  tripOptions: [
    {
      label: "وصل عادي",
      meta: "3 دقائق",
      price: "25 ر.س",
      active: true
    },
    {
      label: "وصل بلس",
      meta: "5 دقائق",
      price: "34 ر.س",
      active: false
    }
  ],
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
