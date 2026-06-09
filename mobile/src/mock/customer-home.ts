import { Briefcase, Car, Home, MapPin, Navigation, Search, User } from "lucide-react-native";

export const customerHomeMock = {
  customerName: "علي",
  greeting: "أهلًا بك، علي",
  subtitle: "رحلتك القادمة تبدأ من الخريطة",
  nearbyDrivers: "8",
  eta: "3 د",
  suggestedFare: "25 شيكل",
  pickup: "زواتا",
  pickupDetail: "موقعك الحالي - زواتا",
  destinationHint: "إلى أين وجهتك اليوم؟",
  tripDistance: "2.4 كم",
  defaultPaymentMethod: "كاش عند الاستلام",
  paymentMethods: ["كاش عند الاستلام", "فيزا"] as const,
  savedPlaces: [
    {
      label: "المنزل",
      area: "زواتا",
      detail: "زواتا - قرب الشارع الرئيسي",
      distance: "0.0 كم",
      price: "25 شيكل",
      icon: Home
    },
    {
      label: "مطعم شورما عكيفك",
      area: "نابلس - رفيديا",
      detail: "مطعم شورما عكيفك",
      distance: "2.4 كم",
      price: "25 شيكل",
      icon: MapPin
    },
    {
      label: "جامعة النجاح",
      area: "نابلس - الحرم الجديد",
      detail: "بوابة الجامعة الرئيسية",
      distance: "3.1 كم",
      price: "31 شيكل",
      icon: Briefcase
    },
    {
      label: "الدوار",
      area: "نابلس - وسط البلد",
      detail: "منطقة الدوار",
      distance: "2.8 كم",
      price: "28 شيكل",
      icon: MapPin
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
