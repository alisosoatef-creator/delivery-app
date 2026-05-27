# Manual Test Checklist

## Run Commands
- Start Backend: `npm.cmd run api`
- Start Frontend: `npm.cmd run dev`
- Production build: `npm.cmd run build`
- Static project check: `npm.cmd run check`
- Backend smoke/API check: `npm.cmd run api:check`

## Customer Flow
- Open the Frontend and confirm the guest starts at Auth only.
- Register a Customer with name, phone, age, birth date, city, and password.
- Verify OTP with `1234`, then log in.
- Create a ride from the Customer request screen with city, pickup, destination, route, and payment method.
- Confirm the ride starts as `searching` and does not show driver details before acceptance.
- Open ride history and confirm the new ride appears.

## Driver Flow
- Use `DriverDevLogin` only in development.
- Confirm only approved/active captains can enter.
- Confirm available rides appear.
- Accept a ride and move it through `driver_arriving`, `arrived`, `in_progress`, and `completed`.
- Test live tracking status with GPS allowed and with GPS denied.

## Smart Dispatch QA
- Put one approved captain online and confirm a new `searching` ride appears in Available Rides.
- Put another approved captain offline and confirm no new requests are shown, with a clear offline message.
- Suspend a captain and confirm no requests are shown, with a clear inactive/suspended message.
- Accept a ride with Captain A, then confirm Captain B cannot accept the same ride and sees a not-available result.
- While Captain A has an active ride, create a second ride and confirm Captain A does not see or accept it until the first ride is completed/cancelled.
- Confirm Arabic/English city names such as `nablus` and `نابلس` do not hide matching requests.
- If driver location is available, confirm nearby requests are listed before farther requests; if not, confirm same-city fallback still works.

## Admin Flow
- Use `AdminDevLogin` only in development.
- Confirm Admin Dashboard loads without showing customer or driver-only controls.
- Review captain applications, open the details drawer, approve, and reject.
- Open ride, customer, driver, support, and payment details drawers.
- Confirm Settings tabs render: General, Pricing, Payments, Support, Security, Team.
- Confirm Team roles are only `owner`, `admin`, and `support`.

## Admin Super Control QA
- Dashboard: confirm the control ribbon summarizes active rides, completed/cancelled rides, active captains, open support, and completed payments.
- Rides: filter by status and city, open the ride drawer, and confirm customer, captain, route, fare, payment, status, and timeline are readable.
- Drivers: confirm active/suspended and online/offline badges are clear, then open driver details for vehicle, plate, rides, and estimated earnings.
- Customers: confirm status, verification, city, ride count, recent rides, and linked support details are visible without technical data.
- Support: filter by status, role, and type, then close and reopen a ticket from the row and detail drawer.
- Payments: confirm cash, demo card, wallet, and pending badges are clear and no full card number, CVV, token, or password hash appears.
- Settings records cleanup: confirm “إعادة ضبط بيانات التجربة” is shown instead of raw internal labels and requires `RESET_DEMO_DATA`.

## Three Window Ride Test
- Window 1: Customer creates a ride.
- Window 2: Driver accepts the ride and updates statuses.
- Window 3: Admin watches ride state, dashboard counts, and payments/support lists.
- Confirm Socket.IO real-time updates reduce the need for manual refresh.

## GPS And Routing
- Select each supported West Bank city and confirm the map moves to that city.
- Use current location with browser permission allowed.
- Deny GPS and confirm the app falls back gracefully.
- Select pickup and destination and confirm road route or Haversine fallback is shown.

## Payments And Wallet
- Create a cash ride and complete it.
- Confirm payment appears in Customer payments, Admin payments, and Driver earnings.
- Add VISA Placeholder card and confirm only `last4` is shown or stored in the UI.
- Confirm no CVV or full card number is displayed after submit.

## Support
- Create a Customer support ticket.
- Create a Driver support ticket.
- Admin filters tickets by role, status, and type.
- Close and reopen a ticket.
- Confirm support real-time events update the admin view when available.

## CSV Export
- Export CSV from rides, customers, drivers, captain applications, payments, support, and pricing.
- Confirm exported data reflects the currently filtered visible rows.
- Confirm no passwords, tokens, full card numbers, or CVV values are exported.

## Role Guards
- Guest sees Auth only.
- Customer can access CustomerShell only.
- Driver can access DriverShell only.
- Admin/Owner can access AdminShell only.
- Unauthorized access shows AccessDenied or routes to the correct home surface.
