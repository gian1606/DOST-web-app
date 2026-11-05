# Dynamic Barangay Management — Testing Guide

## Overview

The DOST BE-SMART web application now supports **dynamic Barangay management** by the Super Admin role. The database starts with **zero barangays**, providing a clean slate for multi-location scalability.

---

## What Changed

### Backend (DOST-api)

1. **Database Migration Updated**
   - File: `src/db/migrations/add_super_admin_tables.sql`
   - **Removed:** 15 hardcoded barangay seed records
   - **Result:** Fresh database starts with 0 barangays

2. **API Endpoints** (Already Existed)
   - `GET /api/sa/barangays` — List all barangays
   - `POST /api/sa/barangays` — Create new barangay
   - `PUT /api/sa/barangays/:id` — Update barangay details
   - `DELETE /api/sa/barangays/:id` — Delete barangay
   - **Security:** All endpoints require `super_admin` role

### Frontend (DOST-web-app)

1. **New Page: Barangay Management**
   - Route: `/super-admin/barangays`
   - Features:
     - Full CRUD: Create, Read, Update, Delete
     - Search/filter barangays
     - Status toggle (active/inactive)
     - Empty state with helpful messaging
     - Tracks bins and residents per barangay

2. **Updated Pages for Empty State Handling**
   - **User Management:** Disabled "Add Barangay Admin" when no barangays exist
   - **Organization Management:** Disabled "Assign Barangay" when no barangays exist
   - Both show clear guidance to create barangays first

3. **Navigation**
   - Added "Pamamahala ng Barangay" to Super Admin sidebar

---

## Testing Flow: Zero Barangays → Full Setup

### Prerequisites

1. **Fresh database** with migrations run:
   ```bash
   # From DOST-api directory
   node src/db/migrations/run-migration.js add_super_admin_tables.sql
   node src/db/migrations/run-migration.js add_clusters.sql
   ```

2. **Super Admin account** created (role: `super_admin`)

3. **Both servers running:**
   ```bash
   # Terminal 1 - API
   cd DOST-api
   npm run dev

   # Terminal 2 - Web App
   cd DOST-web-app
   npm run dev
   ```

---

### Test Step 1: Verify Empty State

**Goal:** Confirm the application handles zero barangays gracefully.

1. **Login as Super Admin**
   - Navigate to `http://localhost:5173`
   - Login with super_admin credentials

2. **Check Barangay Management Page**
   - Click "Pamamahala ng Barangay" in sidebar
   - **Expected:** Empty state message with "No Barangays Yet" and guidance
   - **Expected:** "Create First Barangay" button visible

3. **Check User Management Page**
   - Navigate to "Pamamahala ng Gumagamit"
   - **Expected:** "Add Barangay Admin" button is **disabled**
   - **Expected:** Hover tooltip says "No barangays available. Create barangays first in Barangay Management."
   - Try opening the modal anyway (if you can):
     - **Expected:** Barangay dropdown shows empty state message
     - **Expected:** Email/password fields are hidden
     - **Expected:** "Create Account" button is disabled

4. **Check Organization Management Page**
   - Navigate to "Pamamahala ng Organisasyon"
   - Create a test cluster (e.g., "SOLID-EAST")
   - Click on the cluster to view its barangays
   - **Expected:** "Assign Barangay" button is **disabled**
   - **Expected:** Hover tooltip says guidance message
   - Try opening the assign modal (if you can):
     - **Expected:** Shows "No Barangays Available" message with icon
     - **Expected:** Guidance to create barangays first

✅ **Pass Criteria:** All pages show appropriate empty states without errors.

---

### Test Step 2: Create First Barangay

**Goal:** Verify barangay creation works correctly.

1. **Navigate to Barangay Management**
   - Click "Create First Barangay" button

2. **Fill in the form:**
   - **Barangay Name:** `Alangilan` (required)
   - **Barangay Captain:** `Juan Dela Cruz` (optional)
   - **Contact Email:** `alangilan@batangascity.gov.ph` (optional)

3. **Submit**
   - Click "Create Barangay"
   - **Expected:** Modal closes
   - **Expected:** "Alangilan" appears in the barangay list
   - **Expected:** Shows 0 bins, 0 residents, "Active" status

4. **Create More Barangays**
   - Add at least 2 more: `Cuta`, `Kumintang Ibaba`

✅ **Pass Criteria:** All barangays appear in the list with correct data.

---

### Test Step 3: Edit and Delete Barangay

**Goal:** Verify update and delete operations work.

1. **Edit a Barangay**
   - Click "Edit" button on "Cuta"
   - Change captain to `Maria Santos`
   - Change email to `cuta@batangascity.gov.ph`
   - Submit
   - **Expected:** Changes are saved and displayed

2. **Toggle Status**
   - Click the "Active" badge on "Kumintang Ibaba"
   - **Expected:** Badge changes to "Inactive"
   - Click again
   - **Expected:** Badge changes back to "Active"

3. **Delete a Barangay**
   - Click "Delete" on "Kumintang Ibaba"
   - **Expected:** Confirmation modal appears with warning about bins/residents
   - Confirm deletion
   - **Expected:** Barangay is removed from list

✅ **Pass Criteria:** CRUD operations work without errors. Deleted barangay no longer appears.

---

### Test Step 4: Create Barangay Admin (Punong Barangay)

**Goal:** Verify you can now create PB admin accounts.

1. **Navigate to User Management**
   - **Expected:** "Add Barangay Admin" button is now **enabled**

2. **Open Create Modal**
   - Click "Add Barangay Admin"
   - **Expected:** Barangay dropdown is populated with "Alangilan" and "Cuta"
   - **Expected:** Email and password fields are visible

3. **Fill Form:**
   - **Barangay:** `Alangilan`
   - **Email:** `pb.alangilan@besmart.gov.ph`
   - **Initial Password:** `TempPass123`

4. **Submit**
   - Click "Create Account"
   - **Expected:** Account appears in the table
   - **Expected:** Shows barangay name, email, 0 bins, 0 residents

✅ **Pass Criteria:** PB admin account is created and visible in the list.

---

### Test Step 5: Assign Barangay to Cluster

**Goal:** Verify cluster-barangay assignment works.

1. **Navigate to Organization Management**

2. **Create or Select a Cluster**
   - If not exists, create "SOLID-EAST" cluster
   - Click on the cluster to view details

3. **Assign Barangay**
   - **Expected:** "Assign Barangay" button is now **enabled**
   - Click it
   - **Expected:** Dropdown shows "Alangilan" and "Cuta"
   - Select "Alangilan"
   - Submit

4. **Verify Assignment**
   - **Expected:** "Alangilan" appears in the cluster's barangay list
   - **Expected:** Can remove it by clicking X icon

5. **Test Already Assigned Behavior**
   - Try assigning "Alangilan" to another cluster
   - **Expected:** Dropdown note shows "(currently in SOLID-EAST)"
   - **Expected:** Assignment moves barangay to new cluster (one cluster per barangay)

✅ **Pass Criteria:** Barangays can be assigned and reassigned between clusters.

---

### Test Step 6: Verify Data Persistence

**Goal:** Ensure data survives page refresh.

1. **Refresh the browser** (F5 or Ctrl+R)

2. **Check Barangay Management**
   - **Expected:** All created barangays still appear

3. **Check User Management**
   - **Expected:** PB admin account still exists

4. **Check Organization Management**
   - **Expected:** Cluster assignments persist

✅ **Pass Criteria:** No data loss after refresh.

---

### Test Step 7: Backend Validation

**Goal:** Verify backend constraints work.

1. **Duplicate Barangay Name**
   - Try creating another barangay named "Alangilan"
   - **Expected:** Error: "Barangay already exists."

2. **Invalid Email**
   - Try creating PB admin with email `notanemail`
   - **Expected:** Error: "Enter a valid email."

3. **Delete Barangay with Admin**
   - Delete "Alangilan" barangay
   - **Expected:** Associated PB admin account may be affected (check backend behavior)
   - **Note:** This depends on foreign key constraints in the database

✅ **Pass Criteria:** Backend validation prevents invalid data.

---

## Database Verification (Optional)

Connect to PostgreSQL and verify:

```sql
-- Check barangays table
SELECT * FROM public.barangays;

-- Check PB admin accounts
SELECT id, name, email, role, barangay FROM public.users WHERE role = 'punong_barangay';

-- Check cluster assignments
SELECT 
  c.name AS cluster,
  b.name AS barangay
FROM public.clusters c
JOIN public.cluster_barangays cb ON cb.cluster_id = c.id
JOIN public.barangays b ON b.id = cb.barangay_id;
```

---

## Expected Workflow Summary

```
1. Fresh Install (0 barangays)
   ↓
2. Super Admin logs in
   ↓
3. Creates barangays via Barangay Management page
   ↓
4. Creates Punong Barangay admin accounts (now dropdown populated)
   ↓
5. Organizes barangays into clusters (now assign button enabled)
   ↓
6. System ready for operation
```

---

## Rollout Instructions for Teammates

### After pulling these changes:

1. **Update dependencies:**
   ```bash
   npm install
   ```

2. **Drop and recreate the database** (if you had seed data):
   ```sql
   DROP DATABASE IF EXISTS dostbesmart_db;
   CREATE DATABASE dostbesmart_db;
   ```

3. **Run migrations:**
   ```bash
   node src/db/migrations/run-migration.js add_super_admin_tables.sql
   node src/db/migrations/run-migration.js add_clusters.sql
   node src/db/migrations/run-migration.js add_collector_units.sql
   ```

4. **Create a Super Admin account** (if not exists):
   ```bash
   # Use your existing script or SQL
   INSERT INTO public.users (name, email, password_hash, role)
   VALUES ('Super Admin', 'admin@besmart.gov.ph', '$2b$10$...hash...', 'super_admin');
   ```

5. **Start servers and test the flow above**

---

## Known Limitations & Future Enhancements

### Current Limitations:

1. **Reports Page** still uses mock barangay data (no backend implemented yet)
2. **MRF_FACILITIES** list in constants is hardcoded (future: load dynamically)
3. **PB_BARANGAY** constant is a demo fallback (real users get from their profile)

### Future Enhancements:

1. Barangay bulk import (CSV upload)
2. Barangay merge/split functionality
3. Historical data migration when renaming barangays
4. Audit log for barangay changes

---

## Troubleshooting

### "Add Barangay Admin" button stays disabled even after creating barangays

**Cause:** Frontend hasn't refreshed the barangay list.

**Fix:**
1. Navigate away from User Management and back
2. Refresh the page
3. Check browser console for API errors

---

### "Barangay already exists" error when creating

**Cause:** Duplicate name in database (case-insensitive).

**Fix:**
1. Use a different name
2. Or delete the existing barangay first

---

### Deleted barangay still appears in dropdown

**Cause:** Component state not updated.

**Fix:**
1. Refresh the page
2. Navigate to Barangay Management to verify deletion
3. Check backend logs for delete confirmation

---

## Success Criteria

✅ Database starts with 0 barangays  
✅ Super Admin can create barangays dynamically  
✅ All pages handle empty state gracefully  
✅ Barangay CRUD operations work end-to-end  
✅ PB admin creation requires existing barangays  
✅ Cluster assignment requires existing barangays  
✅ Data persists across page refreshes  
✅ No console errors during normal operation  

---

## Files Modified

### Backend
- `DOST-api/src/db/migrations/add_super_admin_tables.sql`

### Frontend
- `DOST-web-app/src/App.jsx`
- `DOST-web-app/src/constants/index.js`
- `DOST-web-app/src/roles/super-admin/components/Sidebar.jsx`
- `DOST-web-app/src/roles/super-admin/pages/BarangayManagement.jsx` (NEW)
- `DOST-web-app/src/roles/super-admin/pages/UserManagement.jsx`
- `DOST-web-app/src/roles/super-admin/pages/OrganizationManagement.jsx`

---

## Contact

For questions or issues with this feature, contact the development team or refer to the project's architecture documentation in `.kiro/steering/web-app-architecture.md`.
