# West Bank Delivery App Design

## Approved Direction

Build the first version as one interactive app with a single login screen. The login screen lets the user choose either customer or driver, while an admin view is available inside the same product shell for operations. The first version focuses on the experience and visual system; real GPS, maps, OTP, notifications, payments, and realtime sockets are simulated in the interface until backend credentials and provider choices are ready.

## Product Scope

The app serves cities in the West Bank, including Nablus, Ramallah, Jenin, Qalqilya, Hebron, Bethlehem, Tulkarm, Jericho, Salfit, Tubas, and Al-Bireh. Customers can choose a city, see a pickup and destination, match with a nearby driver, view ETA, distance, fare in shekels, order status, cash payment, wallet balance, notifications, and ratings. Drivers can switch online or offline, see nearby requests, accept a ride, view customer details, track trip progress, and see wallet/earnings. Admins can monitor active rides, drivers, city demand, revenue, complaints, and service health.

## Visual System

The interface uses a premium dark palette with matte black backgrounds, charcoal panels, soft gold/yellow accents, white primary text, and muted gray secondary text. Cards use tight radius, restrained borders, and small shadows. The app should feel smooth, modern, serious, and practical for repeated use, not like a marketing landing page.

## Architecture

The current environment does not expose `npm`, so the runnable first version is a dependency-free web app in `index.html`. React/Vite project files are included so the same product can be moved into a normal React toolchain later. Backend design is documented separately with API contracts and a SQL schema.

## First Version Constraints

The app must open locally without installing packages. Map and realtime behavior are visual simulations. OTP login accepts a mock code. No production secrets, external API keys, real payments, or real push providers are included.
