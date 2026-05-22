# Wasel Mobile Foundation

This folder is the Expo / React Native foundation for the Wasel people-delivery app. It is not a store-ready mobile app yet; it is a local development base connected to the same Backend APIs used by the web app.

## Current Status
- Framework: Expo SDK 54 with Expo Router.
- Entry: `app/index.js` renders `src/App.js`.
- Structure: new feature code lives under `mobile/src/`.
- Existing legacy prototype files remain in `components/wasel-mobile-app.js`, `data/fallback.js`, and `lib/api.js` for reference only.

## Install
From the repository root:

```powershell
npm.cmd run mobile:install
```

Or from this folder:

```powershell
npm.cmd install
```

## Run Backend First
From the repository root:

```powershell
npm.cmd run api
```

The local Backend defaults to `http://127.0.0.1:3001`.

## Configure API URL
The mobile client reads:

```text
EXPO_PUBLIC_API_BASE_URL
```

Default:

```text
http://127.0.0.1:3001/api
```

Important local networking notes:
- Expo Web/local desktop can use `http://127.0.0.1:3001/api`.
- Android emulator usually needs `http://10.0.2.2:3001/api`.
- A real phone must use your computer LAN IP on the same Wi-Fi, for example `http://192.168.1.20:3001/api`.
- Do not put secrets in `EXPO_PUBLIC_*` variables.

## Start Expo
From the repository root:

```powershell
npm.cmd run mobile:start
```

Or from this folder:

```powershell
npm.cmd run start
```

Use Expo Go first. No custom native build is needed for this foundation.

## Implemented Foundation
- Auth screens: Login, Register, OTP.
- Customer screens: Home, Request Ride, My Rides, Wallet, Support, Account.
- Driver screens: Dev Driver Login, Home, Available Rides, Current Ride, Earnings, Support.
- Mobile UI components: Button, Card, Input, Badge, ScreenContainer, LoadingState, EmptyState.
- API client with basic error handling and dev driver headers.
- GPS foundation with `expo-location`.
- Destination search through the local Backend endpoint `/api/places/search`.
- Customer mobile ride request flow: pickup, destination, quote, create ride, and ride status card.
- Driver mobile ride flow: available rides, accept ride, current ride, status sequence, and GPS tracking foundation.
- Mobile Socket.IO client for ride events and driver location events.
- Mobile ride map using `react-native-maps` in Expo Go, with a safe fallback preview if the native map is unavailable.
- Customer realtime ride status updates and live driver marker after acceptance.
- Driver realtime available rides refresh, current ride updates, and live GPS broadcasting.
- SecureStore session persistence for customer and driver development sessions.
- Automatic session restore on app start with a loading state.
- Logout cleanup for SecureStore and Socket.IO.

## Development Flows
- Customer register uses `POST /api/auth/register`.
- OTP uses `POST /api/auth/verify-otp` with dev code `1234`.
- Login uses `POST /api/auth/login`.
- Customer GPS asks for foreground location permission. If denied, the app uses the selected city center as pickup.
- Destination search uses `GET /api/places/search?city=&q=` and local/mock places from the Backend.
- Ride quote uses Haversine distance locally, then `POST /api/rides/quote`.
- Create ride uses `POST /api/rides` with pickup/destination labels and coordinates.
- Ride status refresh uses `GET /api/customer/rides/:id`.
- Customer rides use `GET /api/customer/rides`.
- Driver dev login uses `POST /api/driver/dev-login`.
- Available rides use `GET /api/driver/available-rides`.
- Driver current rides use `GET /api/driver/my-rides`.
- Driver accept uses `PATCH /api/rides/:id/accept`.
- Driver status updates use `PATCH /api/driver/rides/:id/status`.
- Mobile realtime connects to the backend Socket.IO server using `EXPO_PUBLIC_SOCKET_URL`, or the API host without `/api`.
- Customer ride status listens to `ride:accepted`, `ride:status-updated`, `ride:cancelled`, `ride:completed`, `driver:location-updated`, and `driver:location-unavailable`.
- Driver screens listen to `ride:created`, `ride:accepted`, and `ride:status-updated`.
- Customer login saves token, role, user id, and phone in `expo-secure-store`.
- Driver dev login saves token, role, driver id, phone, and approved driver data in `expo-secure-store`.
- Passwords are never stored by the mobile session layer.

## GPS Notes
- Expo Go will prompt for location permission.
- GPS refusal should not break the app; customer pickup falls back to the selected city center.
- Driver GPS tracking uses `watchPositionAsync` and sends `driver:location-updated` through Socket.IO while tracking is active.
- If Socket.IO is disconnected, REST refresh remains available and the UI shows a manual-update state.
- Socket.IO reconnects automatically and rejoins customer, driver, and ride rooms from the restored session context.
- If the backend is unavailable, the current screen keeps its local state and shows a clear Arabic connection message.

## Mobile Map Notes
- `react-native-maps` is used for the mobile ride map.
- The map shows pickup, destination, driver/current location markers, and a simple line.
- Before acceptance the line represents pickup to destination.
- After acceptance and driver GPS, the line represents driver to pickup.
- If native maps are unavailable in a test environment, `MobileRideMap` falls back to a compact preview card.

## Session Persistence
- Session storage lives in `src/services/sessionStorage.js`.
- `saveMobileSession` stores the customer session after login.
- `saveDriverSession` stores the development driver session after Driver Dev Login.
- `loadMobileSession` runs when the app starts and returns the user to the correct customer or driver area.
- `clearMobileSession` runs during logout.
- Logout also disconnects Socket.IO so old tokens are not reused.

## Common Connection Issues
- A real phone cannot use `127.0.0.1`; use the computer LAN IP in `EXPO_PUBLIC_API_BASE_URL`.
- If REST works but realtime does not, set `EXPO_PUBLIC_SOCKET_URL` to the same host without `/api`.
- For Android emulator use `10.0.2.2` for both API and Socket URL.
- Restart Expo after changing `.env`.

## Test Session Restore
1. Start the backend with `npm.cmd run api`.
2. Start Expo with `npm.cmd run mobile:start`.
3. Login as customer or driver.
4. Close Expo Go fully and reopen the app.
5. The app should show a restore loading state, then open the correct customer or driver home.
6. Press logout and reopen; the app should return to Login.

## Phase 26 TODO
- Persistent token storage with SecureStore.
- Production-grade mobile navigation and deep links.
- Better offline/error states.

## Phase 27 TODO
- Mobile map route-by-road instead of simple line.
- Persist driver tracking preferences safely.
- Add richer offline recovery for Socket.IO reconnects.

## Phase 28 TODO
- Replace development tokens with production sessions/JWT later.
- Add token refresh once backend supports it.
- Add deeper offline caching for recent rides.

## Check
From the root:

```powershell
npm.cmd run mobile:check
```
