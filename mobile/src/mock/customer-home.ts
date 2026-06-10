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
  matchingCaptains: "3 كباتن يطابقون الطلب",
  captain: {
    name: "أحمد محمد",
    initials: "أ",
    rating: "4.9",
    phone: "+970 59 555 1234",
    carModel: "تويوتا كامري 2022",
    carColor: "أبيض",
    plate: "1234",
    arrivalEta: "3 د",
    locationLabel: "قريب من رفيديا",
    status: "الكابتن في الطريق إليك"
  },
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
  searchTab: {
    title: "بحث سريع",
    subtitle: "اختر وجهة محفوظة أو ابدأ من الخريطة",
    hint: "الأماكن القريبة في نابلس جاهزة كتجربة mock"
  },
  trips: {
    title: "رحلاتي",
    activeTitle: "رحلة حالية",
    activeStatus: "كابتن في الطريق",
    current: {
      route: "زواتا ← نابلس - رفيديا",
      captain: "أحمد محمد",
      price: "25 شيكل",
      time: "اليوم 10:24",
      payment: "كاش عند الاستلام"
    },
    historyTitle: "رحلات سابقة",
    history: [
      {
        id: "trip-001",
        destination: "جامعة النجاح",
        date: "أمس",
        price: "31 شيكل",
        status: "مكتملة"
      },
      {
        id: "trip-002",
        destination: "نابلس - وسط البلد",
        date: "الأحد",
        price: "28 شيكل",
        status: "مكتملة"
      }
    ]
  },
  profile: {
    title: "حساب العميل",
    name: "علي محمد",
    phone: "+970 59 000 4321",
    city: "نابلس",
    homeArea: "زواتا",
    defaultPayment: "كاش عند الاستلام",
    rating: "4.9"
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
