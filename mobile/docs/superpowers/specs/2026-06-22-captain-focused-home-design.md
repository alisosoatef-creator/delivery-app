# Captain Focused Home Design

## Goal

Give the captain one fast decision surface for the nearest request without repeating the same request details across multiple cards.

## Approved Experience

- Keep the Wasel header, online toggle, greeting, and floating bottom navigation.
- Remove earnings metrics, the large operations center, and the realtime feed from the main captain home.
- Show one nearest-request card with customer, fare, route, arrival time, distance, payment, and the core actions.
- Keep direct accept, decline, and contact actions available.
- Replace the compact request card with the full request details when the captain presses `عرض التفاصيل`.
- Keep service type, customer note, payment, route, fare, arrival estimate, and final confirmation in the details view.
- Show realtime connection and activity only in the requests tab.
- Keep earnings, profile, and active-trip flows unchanged.

## Interaction

The captain can accept directly from the compact card or inspect the request first. Opening details must not render a second copy of the compact card. Cancelling details restores the same nearest-request card.

## Testing

Tests must verify the focused home, compact request card, hidden secondary panels, details replacement, return behavior, realtime placement, and all existing accept/decline/trip flows.
