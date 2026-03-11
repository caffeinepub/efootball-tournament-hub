# eFootball Tournament Hub

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Homepage with hero section and Join Tournament button
- Player slot system: configurable number of slots, players enter name to claim a slot
- Poll system: admin creates poll with options, players vote once
- Winner board: admin posts winner results
- Entry fee display (admin editable)
- Tournament date & time display (admin editable)
- Theme system: admin uploads background images per section (home, slots, poll) from device
- Admin panel: password-protected, controls all editable fields
- Bottom navigation bar: Slots, Poll, Winner, Exit tabs
- Full localStorage persistence (no data loss on refresh)
- Dark gaming UI, mobile-first (Android), eFootball themed

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: simple Motoko canister (minimal, data stored in localStorage frontend-side)
2. Frontend pages: Home, Slots, Poll, Winner, Admin
3. State: React context + localStorage sync for all data
4. Admin auth: hardcoded password check stored in localStorage session
5. Theme system: FileReader API to convert uploaded images to base64, stored in localStorage per section
6. Poll: one vote per browser session (stored in localStorage)
7. Bottom nav with 4 tabs (Slots, Poll, Winner, Exit)
8. Responsive dark gaming design
