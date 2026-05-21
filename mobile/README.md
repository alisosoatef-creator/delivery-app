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

## Development Flows
- Customer register uses `POST /api/auth/register`.
- OTP uses `POST /api/auth/verify-otp` with dev code `1234`.
- Login uses `POST /api/auth/login`.
- Ride quote uses `POST /api/rides/quote`.
- Customer rides use `GET /api/customer/rides`.
- Driver dev login uses `POST /api/driver/dev-login`.
- Available rides use `GET /api/driver/available-rides`.
- Driver current rides use `GET /api/driver/my-rides`.

## Phase 26 TODO
- Native mobile GPS permissions and live location tracking.
- Native map/routing screen without Google Maps.
- Socket.IO client integration for ride updates.
- Persistent token storage with SecureStore.
- Production-grade mobile navigation and deep links.
- Better offline/error states.

## Check
From the root:

```powershell
npm.cmd run mobile:check
```
