# Customer Focused Home Design

## Goal

Make the customer home screen immediately understandable by presenting one primary decision: start a ride request.

## Approved Experience

- Keep the Wasel header, short greeting, notifications entry, and floating bottom navigation.
- Show one compact readiness surface before booking.
- Make the `اطلب رحلة` button the strongest and largest element in the content area.
- Keep service type, pickup, destination, map, notes, and payment inside the dedicated booking flow.
- Remove duplicated launcher title and explanatory copy that repeat the page heading.

## Interaction

Pressing `اطلب رحلة` continues to the existing three-option service selection page. Returning home restores the same focused launcher without losing or exposing operational booking details.

## Motion And Accessibility

Reuse the shared motion components from phase 30, keep the button reachable by its current accessibility label, preserve RTL, and use short copy that fits narrow Android screens.

## Testing

The customer screen test must verify the focused surface, readiness status, single booking action, absence of duplicated launcher copy, and the unchanged transition into the booking workspace.
