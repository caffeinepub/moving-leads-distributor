# Moving Leads Distributor

## Current State
- Full leads management: create, update, delete leads with status (new/distributed/closed)
- Companies management: create, update, delete moving companies
- Lead distribution: assign/remove leads to companies, auto-updates lead status
- Activity log per lead: admin can add notes, assignments are auto-logged
- Authorization: single admin via Internet Identity
- No price per lead or billing functionality

## Requested Changes (Diff)

### Add
- `pricePerLead` field (Nat, in cents) on the `Company` type in the backend
- `setCompanyPricePerLead(companyId, price)` update function (admin only) to set/update price per lead for a company
- `getBillingSummary()` query returning per-company billing data: company name, total leads assigned, breakdown by move size (studio/1BR/2BR/3BR+), pricePerLead, and total billing amount
- Price per lead display and inline edit on the Companies page (admin can set/edit it)
- "Billing" tab in the main navigation
- Billing page with a summary table: Company Name | Studio | 1BR | 2BR | 3BR+ | Total Leads | Price/Lead | Total Billing
- Grand total row at the bottom of the billing table (sum of all company totals)
- Auto-calculated totals (no button required -- reactive)

### Modify
- `createCompany` and `updateCompany` to include the `pricePerLead` field (default 0 if not set)
- Companies page: add Price/Lead column and inline edit capability

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend: add `pricePerLead` to Company type, update create/update/delete company functions, add `setCompanyPricePerLead`, add `getBillingSummary` query
2. Update frontend Companies page to display and allow editing of pricePerLead per company
3. Add Billing tab to navigation
4. Build Billing page with auto-calculated summary table and grand total row

## UX Notes
- Price per lead displayed as dollars (e.g. $25.00) on Companies and Billing pages
- Billing table auto-updates as leads are distributed
- Grand total row visually distinct (bold/highlighted)
- Clean, consistent with existing app style
