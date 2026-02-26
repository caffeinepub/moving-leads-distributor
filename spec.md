# Moving Leads Distributor

## Current State
The app has a full leads and companies management system with:
- CRUD for leads (customer name, phone, email, move date, addresses, move size, notes, status)
- CRUD for moving companies
- Lead distribution (assign/remove company assignments)
- Dashboard with leads table, status badges, and company assignment display
- No authentication -- app is fully open

## Requested Changes (Diff)

### Add
- Single admin login screen protecting all app routes
- Internet Identity-based authentication via the authorization component
- Admin-only access: all pages (dashboard, leads, companies) require login
- Logout button in the app header

### Modify
- All existing routes to be gated behind auth check
- Header to include logout button when authenticated

### Remove
- Nothing

## Implementation Plan
1. Select the authorization component
2. Regenerate backend with authorization support (admin principal check on all mutations)
3. Update frontend to:
   - Show login screen if not authenticated
   - Redirect to login on unauthenticated access
   - Add logout button to header
   - Wrap all existing pages with auth guard

## UX Notes
- Login screen should be clean and professional, matching the existing app style
- After login, redirect to the dashboard
- Logout should return to the login screen
