# Ismael Express

## Current State
The app is a luxury menswear e-commerce site with an admin dashboard featuring Products and Payments tabs. Brands are hardcoded as a static array (`BRANDS`) in the frontend — both in the admin product form and the shop's hero/footer text. There is no backend brand management.

## Requested Changes (Diff)

### Add
- Backend: `Brand` type with `id` and `name` fields
- Backend: `addBrand`, `updateBrand`, `deleteBrand`, `getAllBrands` functions (admin-only mutations, public query)
- Admin Dashboard: "Brands" tab in the sidebar nav
- Admin Brands tab: table listing all brands with edit/delete actions, "New Brand" button, add/edit dialog, delete confirmation
- Frontend hooks: `useGetAllBrands`, `useAddBrand`, `useUpdateBrand`, `useDeleteBrand`

### Modify
- Product form brand `<Select>` to use dynamic brands from `getAllBrands` instead of hardcoded `BRANDS` array
- Hero section brand line to use dynamic brands from backend
- Footer contact copy to reference dynamic brands
- Admin dashboard header title to reflect active tab (add "Brands" case)

### Remove
- Hardcoded `BRANDS` constant in AdminDashboard

## Implementation Plan
1. Update `main.mo` to add Brand type, brand storage, and CRUD functions
2. Re-generate `backend.d.ts` types
3. Add brand query hooks to `useQueries.ts`
4. Add `BrandsTab` component to `AdminDashboard.tsx` and wire up the sidebar tab
5. Update `ProductFormDialog` to fetch brands dynamically
6. Update `Hero` and `ContactFooter` in `App.tsx` to show dynamic brands from backend (with fallback)
