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

## 34A Customer App Pro Mode QA

Use this checklist for the upgraded customer experience:

1. Home: تأكد أن الشاشة تعرض ترحيبًا واضحًا، زر اطلب رحلة، كرت رحلة نشطة عند وجودها، واختصارات رحلاتي والمحفظة والدعم والحساب.
2. Request Ride: اختر المدينة، استخدم الموقع أو fallback، ابحث عن الوجهة، وتأكد أن ملخص الطلب يعرض نقطة الانطلاق والوجهة والسعر والمسافة والدفع.
3. Ride Status: أنشئ رحلة وتأكد أن searching واضح، وأن بيانات الكابتن لا تظهر إلا بعد قبول الرحلة.
4. Accepted/In progress: بعد قبول الكابتن وتحديث الحالات، تأكد أن الخريطة والحالة وبيانات الكابتن تبقى واضحة.
5. Completed/Cancelled: أنهِ أو ألغِ رحلة وتأكد أن الشاشة تعرض ملخصًا مفهومًا وليس رسالة خطأ.
6. My Rides: تأكد أن القائمة compact وتعرض من/إلى، الحالة، السعر، الدفع، وزر متابعة للرحلات النشطة فقط.
7. Wallet: تأكد أن رصيد المحفظة واضح، وأن الدفع الإلكتروني التجريبي مشروح بهدوء.
8. Support: أرسل تذكرة دعم، واختر نوع المشكلة، وتأكد أن التذاكر السابقة تظهر بشكل مختصر.
9. Account: تأكد أن الحساب لا يعرض أي معلومات حساسة، وأن زر تسجيل الخروج واضح.

## 36A Smart Dispatch QA

Use this checklist for driver dispatch behavior on mobile:

1. Driver online: sign in as an approved captain, switch availability online, create a customer ride, and confirm the request appears in Available Rides.
2. Driver offline: switch the captain offline and confirm Available Rides shows no requests with a clear availability message.
3. Driver inactive: suspend a captain from Admin and confirm the mobile driver app does not show new requests.
4. Busy driver: accept one ride, create a second ride, and confirm the same captain does not see or accept the second request until the active ride is completed/cancelled.
5. Race safety: try accepting an already accepted ride from another captain and confirm the app shows a clear not-available message.
6. City normalization: create requests with Arabic/English city labels and confirm matching city requests still appear.
7. Realtime/refetch: create a ride while the driver screen is open and confirm the list updates automatically or after tapping refresh.

## 36B Mobile UI Reality QA

Use this checklist after reviewing the app on a real device:

1. Brand header: confirm the compact Wasel mark appears clearly without taking too much vertical space.
2. Bottom navigation: confirm it is slim, the active state is visible, and the last card/button on every tab stays above it.
3. Customer Home: confirm the hero feels focused, the "اطلب رحلة" action is obvious, and shortcuts are compact.
4. Request Ride: confirm the map appears near the top, pickup/destination/price controls are compact, and the final action is reachable.
5. Ride Status: confirm the map, tracking state, driver card, and summaries are clear without large overlays.
6. My Rides, Wallet, Support, Account: confirm cards are lighter, text is readable, and empty states do not leave dead space.
7. Driver Home: confirm availability, stats, current ride, and quick actions read like a working driver dashboard.
8. Available and Current Ride: confirm ride cards are compact, the map is integrated, and only one next action is prominent.
9. Map: confirm markers, distance badge, fallback card, and small legend feel integrated with the dark theme.
10. Arabic copy: confirm no technical words or non-ride terms appear in normal customer/driver flows.

## 37D Driver Online Status Sync QA

Use this checklist for captain availability sync on mobile:

1. Driver login: sign in with Driver Dev Login and confirm the home screen reads the saved DB availability, not a local default.
2. Toggle online: switch the captain to available and confirm the UI updates, the session persists, and Available Rides can show matching requests.
3. Toggle offline: switch the captain to unavailable and confirm Available Rides shows no new requests with a clear availability message.
4. Admin sync: open Admin Drivers on web and confirm the same captain shows `online`/`offline` as available/unavailable after refresh or realtime update.
5. Inactive guard: suspend the captain from Admin and confirm the mobile app cannot switch that captain online.
6. Current ride safety: if the captain goes unavailable while already on an active ride, confirm the current ride remains usable but new requests are blocked.

## 37C Ride Rating QA

Use this checklist for completed ride ratings on mobile:

1. Complete a customer ride from the driver flow and return to Customer Ride Status.
2. Confirm the rating card appears only for a completed ride.
3. Select 1-5 stars, add an optional comment, and submit the rating.
4. Confirm the saved rating appears instead of the form and cannot be submitted twice.
5. Open My Rides and confirm the completed ride shows its rating.
6. Confirm non-completed or cancelled rides do not show a rating form.

## 37E Mobile Visual Identity Final QA

Use this checklist for the final mobile identity pass:

1. Brand header: confirm the compact Wasel mark and app name feel premium without taking over the screen.
2. Theme balance: confirm graphite, teal, and warm accent colors feel calm and consistent across customer and driver screens.
3. Navigation: confirm bottom navigation is slim, readable, safe-area-aware, and does not cover the last action.
4. Customer flow: confirm Home, Request Ride, Ride Status, My Rides, Wallet, Support, Account, and the rating card feel lighter and more focused.
5. Driver flow: confirm Driver Home, Available Rides, Current Ride, Earnings, and Support read as a practical captain app.
6. Map identity: confirm the map frame, markers, distance badge, legend, and fallback card match the premium dark theme.
7. States: confirm empty, loading, and error states use short Arabic copy without technical words.
8. Small screens: confirm cards, buttons, inputs, and rating stars stay inside the screen and remain reachable above navigation.

## 37F Ultimate Mobile App Redesign QA

Use this checklist for the full visual rebuild:

1. First 3 seconds: open Expo Go and confirm Home feels like a new product, not the old dark card layout.
2. New design system: confirm theme tokens include layered graphite backgrounds, electric teal, warm accent, glass surfaces, motion, nav, card, button, chip, badge, and map tokens.
3. Motion: press primary buttons, chips, ride cards, and bottom tabs; confirm scale/opacity feedback feels smooth and lightweight.
4. Brand/header: confirm the Wasel mark has a strong signal/glow treatment and page headers feel premium without consuming too much space.
5. Bottom dock: confirm the floating dock is thinner, numbered, safe-area-aware, and visually different from previous nav.
6. Customer Home: confirm the hero, active ride, and quick actions are rebuilt around a clear "request ride" command.
7. Request Ride: confirm the map appears first, the journey composer follows, and the final summary/CTA feels like a command panel.
8. Ride Status: confirm the tracking map is the hero, live pill is visible, timeline is compact, captain card appears only after acceptance, and rating UI is refined.
9. Driver app: confirm cockpit, availability strip, action grid, available ride cards, and current ride map/action flow feel built for fast captain use.
10. Map: confirm markers, badges, legend, and fallback card match the new electronic visual identity without showing coordinates.
11. Performance: scroll through all tabs and confirm no heavy animation, lag, or Expo Go crash.

## 37G Full Mobile Redesign A-Z QA

Use this checklist for the black/purple full redesign:

1. Identity shift: confirm the app no longer feels teal-heavy and now uses deep black, graphite, rich purple, violet, indigo, and subtle magenta.
2. Bottom navigation: confirm labels stay horizontal, readable, RTL-correct, safe-area-aware, and never cover the last visible action.
3. Root layout: open every customer and driver tab and confirm no vertical text collapse, clipped buttons, narrow chips, or broken wrapping.
4. Shared UI: confirm buttons, cards, inputs, chips, badges, timeline, empty/loading/error states, and headers share the new purple/glass system.
5. Customer screens: verify Home, Request Ride, Ride Status, My Rides, Wallet, Support, and Account all look intentionally redesigned.
6. Driver screens: verify Driver Home, Available Rides, Current Ride, Earnings, and Support share the cockpit/dashboard language.
7. Maps: confirm MobileRideMap uses the purple identity, clean frame, compact badges, clear markers, and a polished fallback.
8. Motion: press CTAs, chips, cards, and nav tabs and confirm the interaction is smooth without visual noise.
9. Stability: complete a ride, rate it, open history, toggle driver availability, and verify no UI redesign broke the existing flows.
