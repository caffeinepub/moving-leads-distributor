# Moving Leads Distributor

## Current State
The app has a full backend with lead management, company management, lead distribution, and an activity log API (`addActivityLog`, `getActivityLog`). The frontend has LeadsPage, CompaniesPage, LeadModal, CompanyModal, and DistributeModal. Login (Internet Identity / admin auth) is in place. The activity log backend exists but is NOT wired to the frontend -- there is no UI to view or add notes/activity log entries per lead.

## Requested Changes (Diff)

### Add
- An activity/notes log panel per lead, accessible from the leads list
- Ability to view all log entries (timestamp + message) for a lead
- Ability to add a new note/activity entry to a lead (text input + submit)
- Auto-generated log entries when a lead is distributed to a company (system note like "Assigned to [Company Name]")
- Auto-generated log entry when a lead is created

### Modify
- LeadsPage: add a way to open the activity log for a specific lead (e.g. a "View Log" button or clicking a row opens a detail panel/modal)

### Remove
- Nothing

## Implementation Plan
1. Create `ActivityLogModal.tsx` component:
   - Shows a chronological list of log entries (timestamp formatted as date/time + message)
   - Has a text input and "Add Note" button to call `backend.addActivityLog(leadId, message)`
   - Fetches log on open via `backend.getActivityLog(leadId)`
   - Loading and empty states handled
2. Update `LeadsPage.tsx`:
   - Add an "Activity" or "Log" button/icon per lead row to open the ActivityLogModal
3. Update `DistributeModal.tsx`:
   - After successfully assigning a lead to a company, call `backend.addActivityLog(leadId, "Assigned to [Company Name]")` for each assigned company
4. Update `LeadModal.tsx`:
   - After successfully creating a new lead, call `backend.addActivityLog(leadId, "Lead created")`

## UX Notes
- Log modal should show newest entries at the top
- Timestamps should be human-readable (e.g. "Feb 26, 2026, 3:45 PM")
- Keep the modal clean: list of entries above, add-note form below
- Use a subtle icon (e.g. ClipboardList or MessageSquare from lucide-react) for the log button in the leads table
