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
