# Wasel Mobile App

This is the real mobile app version of Wasel built with Expo and React Native.

## Run On Your Phone With Expo Go

1. Install Expo Go on your phone.
2. Make sure your phone and computer are on the same Wi-Fi.
3. From the project root, start the backend:

```powershell
npm run api
```

4. In another terminal, start the mobile app:

```powershell
cd mobile
npm start
```

5. Scan the QR code with Expo Go.

The mobile app defaults to this local API:

```text
http://192.168.1.120:3001
```

If your computer IP changes, update the API field on the login screen.

## Android APK Build

When you are ready to create an APK:

```powershell
cd mobile
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

This requires an Expo account. The preview profile is configured in `eas.json` to produce an APK.
