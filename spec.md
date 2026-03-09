# Ismael Express

## Current State
A luxury menswear shop frontend with hardcoded products (Ralph Lauren, Jos. A. Bank, Nike, Adidas). Backend has basic product CRUD (addProduct, getAllProducts, getProduct, getProductsByCategory) but no auth or image storage. No admin area exists.

## Requested Changes (Diff)

### Add
- Admin-only dashboard accessible via `/admin` route
- Admin login via Internet Identity
- Product management: add, edit, delete products with image upload
- Image storage for product photos using blob-storage component
- Payment overview panel for admins to view Stripe transactions/orders
- Role-based access: only the canister owner/admin can access dashboard

### Modify
- Backend: add authorization (admin role), update product model to include imageUrl, add updateProduct and deleteProduct, integrate blob-storage for images
- Frontend: add Admin link in nav (visible to admins), add /admin route with protected dashboard, wire products to backend instead of hardcoded list

### Remove
- Hardcoded product list from frontend (replace with backend data)

## Implementation Plan
1. Select components: authorization, blob-storage, stripe
2. Generate Motoko backend with admin role, product CRUD with imageUrl, payment viewing
3. Build frontend admin dashboard with: login, product table with edit/delete/add, image uploader, payments tab
4. Protect admin route — redirect non-admins
5. Wire public shop to fetch products from backend
