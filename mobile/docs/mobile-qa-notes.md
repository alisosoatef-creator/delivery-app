# Mobile QA Notes

## Scope

This pass reviewed the Expo mobile experience after the real product redesign:

- Auth: Login, Register, OTP, Driver Dev Login.
- Customer: Home, Request Ride, Ride Status, My Rides, Wallet, Support, Account.
- Driver: Home, Available Rides, Current Ride, Earnings, Support.
- Shared UX: bottom navigation, map fallback, loading/empty/error states, Arabic RTL copy, session restore, and live tracking indicators.

## Visual QA Results

- Bottom navigation is compact and token-driven, with safe-area-aware bottom spacing.
- Screens use a shared bottom padding so the last button/card remains reachable above navigation.
- Request Ride keeps the map near the top, with compact pickup, city, destination, price, and order controls.
- Ride Status keeps the map/tracking view first, then state and driver details.
- Driver Current Ride shows one next-status action at a time and keeps tracking controls compact.
- Technical copy was reduced in Account, Support, and Driver Earnings.

## Manual Expo Go Checklist

1. Start backend with `npm.cmd run api`.
2. Start mobile with `npm.cmd run mobile:start`.
3. Login/Register a customer, close Expo Go, reopen, and confirm session restore.
4. Request a ride: choose city, use GPS or fallback, search destination, quote, and create ride.
5. Confirm the active ride card appears on Customer Home after leaving the status screen.
6. Login as driver in DEV, confirm available rides are visible, accept one, and step through statuses.
7. Enable and stop driver live location tracking.
8. Check Wallet, Support, Account, Earnings, and Driver Support for scroll reachability above the bottom nav.

## Deferred Notes

- Real device screenshots should be captured before store preparation.
- Native map rendering should be checked on both Android and iOS devices.
- Production builds should replace DEV driver login with real driver authentication.

## 31A Ride Experience QA

Use this checklist for the upgraded ride experience:

1. Request Ride: choose a city, set pickup with GPS or fallback, search for a destination, confirm compact results, and verify price/distance summary before ordering.
2. Searching: create a ride and confirm the status screen shows "جاري البحث عن كابتن قريب..." with route, distance, price, payment, and a clear cancel action.
3. Accepted: accept the ride as a driver and confirm the customer sees the captain card only after acceptance, including vehicle, plate, rating, and live tracking state.
4. Driver status sequence: confirm the driver sees only one next action at a time: أنا بالطريق, وصلت, بدأت الرحلة, إنهاء الرحلة.
5. Completed: finish the ride and confirm the customer sees a completed summary with destination, price, payment, captain, and actions for a new ride or ride history.
6. Cancelled: cancel a searching or accepted ride and confirm it reads as a cancelled ride summary, not a technical error.
7. Navigation persistence: leave Ride Status, return from Home via "متابعة الرحلة", and confirm My Rides only shows "متابعة" for active rides.

## 32A Map & Tracking QA

Use this checklist for map and live tracking:

1. Before captain acceptance: confirm the customer map shows pickup, destination, and a clear route line without coordinates.
2. After captain acceptance: confirm the customer map keeps pickup/destination and shows the driver marker once GPS tracking starts.
3. Driver GPS on: enable live location from Driver Current Ride and verify the customer receives live driver location updates.
4. Driver GPS denied: deny location permission and confirm the app shows a short, non-technical GPS message and keeps the ride usable.
5. Socket disconnected: stop backend or disconnect temporarily and confirm the app says live updates are unavailable and keeps manual refresh available.
6. Stop tracking: stop driver tracking and confirm the customer sees a waiting/last-known location state without a crash.
7. Invalid coordinates: test with missing pickup/destination values and confirm the map fallback card appears instead of rendering broken markers.
8. Map fallback: test Expo Go on a device where native maps are unavailable and confirm the fallback card shows route summary and distance.

## 33A Driver App Pro Mode QA

Use this checklist for the upgraded driver experience:

1. دخول الكابتن: افتح مدخل الكابتن في وضع التطوير وتأكد أن الجلسة تعود إلى لوحة الكابتن بدون رسائل تقنية.
2. لوحة الكابتن: تحقق من حالة التوفر، عدد الطلبات المتاحة، رحلة حالية إن وجدت، وأزرار عرض الطلبات ورحلتي الحالية والأرباح والدعم.
3. التوفر: بدّل حالة متاح / غير متاح وتأكد أن الرسالة توضّح أثر الحالة بدون تغيير عميق في المنطق الحالي.
4. الطلبات المتاحة: أنشئ رحلة من الزبون وتأكد أن الطلب يظهر ككرت مضغوط فيه من/إلى، المدينة، السعر، المسافة، الدفع، وزر قبول واضح.
5. قبول رحلة: اضغط قبول الرحلة وتأكد أن الرحلة تنتقل إلى رحلتي الحالية.
6. تحديث الحالات: جرّب التسلسل كاملًا: أنا بالطريق، وصلت، بدأت الرحلة، إنهاء الرحلة، وتأكد أن زرًا واحدًا فقط يظهر في كل حالة.
7. تفعيل/إيقاف التتبع: فعّل موقعي المباشر ثم أوقف التتبع وتأكد أن الإيقاف لا يظهر كخطأ.
8. الأرباح: افتح شاشة الأرباح وتأكد أن أرباح اليوم، إجمالي الأرباح، رحلات مكتملة، وسجل العمليات تظهر بصياغة واضحة.
9. الدعم: أرسل تذكرة دعم للكابتن، وتأكد أن نوع المشكلة والرسالة والتذاكر السابقة تظهر بشكل مفهوم.
