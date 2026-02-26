# Moving Leads Distributor

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Moving leads management system for an admin to create, manage, and distribute leads to moving companies
- Lead data: customer name, phone, email, move date, origin address, destination address, move size (studio/1BR/2BR/3BR+), notes, status (new/distributed/closed)
- Moving companies list: company name, contact name, phone, email
- Distribution: assign a lead to one or more moving companies
- Dashboard showing all leads, their status, and assigned companies

### Modify
N/A

### Remove
N/A

## Implementation Plan

**Backend:**
- CRUD for leads (create, read, update, delete)
- CRUD for moving companies (create, read, update, delete)
- Lead distribution: assign/unassign a lead to one or more companies
- Query leads by status; query assignments by lead or company

**Frontend:**
- Dashboard page with leads table (status badges, assigned company names)
- Add/Edit Lead modal
- Add/Edit Moving Company modal
- Distribute Lead modal (multi-select companies from list)
- Companies management page (list, add, edit, delete)

## UX Notes
- Clean, professional look suited for a logistics/moving business
- Color-coded status badges: blue=new, orange=distributed, green=closed
- Easy one-click distribution flow from the leads table
- Responsive layout
