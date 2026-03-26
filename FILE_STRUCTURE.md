# 📁 Complete File Structure Reference

## Project Root Directory Structure

```
Ecommerce/
│
├── 📄 README.md                          # Main project documentation
├── 📄 QUICKSTART.md                      # 5-minute getting started guide
├── 📄 DELIVERABLES.md                    # Complete feature checklist
├── 📄 ARCHITECTURE.md                    # System design & patterns
├── 📄 PROJECT_SUMMARY.md                 # This project summary
│
│
├── 📦 server/                             # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts              # MongoDB connection setup
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts       # JWT auth, validation, rate limiting
│   │   │
│   │   ├── models/
│   │   │   ├── User.model.ts            # User schema with auth
│   │   │   ├── Product.model.ts         # Product catalog schema
│   │   │   ├── Review.model.ts          # Review schema with fit data
│   │   │   ├── Cart.model.ts            # Shopping cart schema
│   │   │   └── Wishlist.model.ts        # Wishlist schema
│   │   │
│   │   ├── controllers/
│   │   │   ├── index.ts                 # Product, review, auth controllers
│   │   │   ├── cart.controller.ts       # Cart & wishlist controllers
│   │   │   └── sizeRecommendation.controller.ts
│   │   │
│   │   ├── routes/
│   │   │   └── index.ts                 # All 16+ API routes
│   │   │
│   │   └── services/
│   │       └── sizeRecommendation.service.ts  # AI size logic
│   │
│   ├── server.ts                         # Express server initialization
│   ├── package.json                      # Dependencies & scripts
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── .env.example                      # Environment template
│   └── README.md                         # Backend documentation
│
│
└── 📦 client/                             # Frontend (Next.js 14)
    ├── app/
    │   ├── layout.tsx                   # Root layout with metadata
    │   ├── providers.tsx                # Theme provider wrapper
    │   │
    │   └── product/[id]/
    │       ├── page.tsx                 # SSR page route
    │       ├── ProductPage.tsx          # Main product component
    │       └── loading.tsx              # Suspense fallback
    │
    ├── components/
    │   ├── product/
    │   │   ├── ImageGallery.tsx         # Image gallery with zoom
    │   │   ├── AISizeModal.tsx          # AI size recommendation modal
    │   │   ├── ColorSelector.tsx        # Color swatches
    │   │   ├── SizeSelector.tsx         # Size buttons
    │   │   ├── QuantitySelector.tsx     # Qty +/- controls
    │   │   ├── ActionButtons.tsx        # Cart, Buy, Wishlist buttons
    │   │   ├── ProductInfo.tsx          # Product details panel
    │   │   └── LiveIndicators.tsx       # Viewer count display
    │   │
    │   ├── tabs/
    │   │   ├── ProductDetails.tsx       # Materials, care, sustainability
    │   │   ├── SizeFitGuide.tsx        # Measurement table
    │   │   ├── ReviewsSection.tsx      # Reviews with filters
    │   │   ├── CompleteTheLook.tsx     # Outfit suggestions
    │   │   └── RelatedProducts.tsx     # Similar products carousel
    │   │
    │   └── ui/
    │       ├── SkeletonLoader.tsx       # Loading placeholders
    │       ├── StarRating.tsx           # Reusable star component
    │       ├── Toast.tsx                # Notification component
    │       └── DarkModeToggle.tsx       # Theme toggle
    │
    ├── store/
    │   ├── cartStore.ts                 # Zustand cart with persistence
    │   └── wishlistStore.ts             # Zustand wishlist with persistence
    │
    ├── lib/
    │   ├── api.ts                       # Typed API helper functions
    │   └── sizeEngine.ts                # Client-side size recommendation
    │
    ├── hooks/
    │   ├── useProduct.ts                # Product data fetching
    │   ├── useSwipeGesture.ts           # Touch event handling
    │   └── useViewerCount.ts            # Live viewer simulation
    │
    ├── types/
    │   └── index.ts                     # TypeScript interfaces & types
    │
    ├── styles/
    │   └── globals.css                  # Tailwind + custom global styles
    │
    ├── next.config.ts                   # Next.js configuration
    ├── tailwind.config.ts               # Tailwind theme configuration
    ├── tsconfig.json                    # TypeScript configuration
    ├── postcss.config.js                # PostCSS configuration
    ├── package.json                     # Dependencies & scripts
    ├── .env.example                     # Environment template
    └── README.md                        # Frontend documentation
```

---

## File Count Summary

| Category | Count | Location |
|----------|-------|----------|
| Backend Models | 5 | `server/src/models/` |
| Backend Controllers | 3 | `server/src/controllers/` |
| Backend Services | 1 | `server/src/services/` |
| Backend Routes | 1 | `server/src/routes/` |
| Backend Config | 2 | `server/src/config/` + `server/` |
| Backend Middleware | 1 | `server/src/middleware/` |
| **Backend Total** | **13** | |
| Frontend Pages | 2 | `client/app/product/[id]/` |
| Frontend Components | 16 | `client/components/` |
| Frontend Stores | 2 | `client/store/` |
| Frontend Lib | 2 | `client/lib/` |
| Frontend Config | 7 | `client/` root |
| Frontend Types | 1 | `client/types/` |
| Frontend Styles | 1 | `client/styles/` |
| **Frontend Total** | **31** | |
| **Documentation** | **5** | Root level |
| **Grand Total** | **49** | |

---

## API Endpoints Reference

```
GET     /api/product/:id
GET     /api/products/related?id=&category=
GET     /api/reviews/:productId?rating=&bodyType=&page=
POST    /api/reviews
POST    /api/size-recommendation
POST    /api/cart
GET     /api/cart
PUT     /api/cart/item
DELETE  /api/cart
POST    /api/wishlist
GET     /api/wishlist
DELETE  /api/wishlist
POST    /api/auth/register
POST    /api/auth/login
GET     /api/user/profile
PUT     /api/user/profile
GET     /api/health
```

---

## Key Technology Files

### TypeScript Configuration
```
server/tsconfig.json        # Backend TS config
client/tsconfig.json        # Frontend TS config
```

### Styling Setup
```
client/tailwind.config.ts   # Tailwind theme customization
client/postcss.config.js    # PostCSS setup
client/styles/globals.css   # Global styles + utilities
```

### Build Configuration
```
server/package.json         # Backend dependencies
client/package.json         # Frontend dependencies
client/next.config.ts       # Next.js optimization
```

### Environment Files
```
server/.env.example         # Backend env template
client/.env.example         # Frontend env template
```

---

## Component Hierarchy

```
app/product/[id]/page.tsx (SSR)
└── ProductPage.tsx
    ├── ImageGallery.tsx
    │   └── (8 thumbnail images)
    ├── ProductInfo.tsx
    │   ├── ColorSelector.tsx
    │   ├── SizeSelector.tsx
    │   ├── AISizeModal.tsx
    │   │   └── (Form + Result display)
    │   ├── QuantitySelector.tsx
    │   ├── ActionButtons.tsx
    │   └── LiveIndicators.tsx
    └── Tabs
        ├── ProductDetails.tsx
        ├── SizeFitGuide.tsx
        ├── ReviewsSection.tsx
        │   └── (Review cards + filters)
        ├── CompleteTheLook.tsx
        │   └── (Product cards)
        └── RelatedProducts.tsx
            └── (Carousel)
```

---

## Store Files Location

```
Zustand Stores
├── store/cartStore.ts
│   ├── addItem()
│   ├── removeItem()
│   ├── updateQuantity()
│   ├── clearCart()
│   └── syncCart()
│
└── store/wishlistStore.ts
    ├── addItem()
    ├── removeItem()
    ├── isInWishlist()
    ├── clearWishlist()
    └── syncWishlist()
```

---

## Import Path Reference

### Absolute Imports (Configured in tsconfig.json)
```typescript
// Instead of: ../../../store/cartStore
// Use:
import { useCartStore } from '@/store/cartStore'
import { Product } from '@/types'
import { getSizeRecommendation } from '@/lib/sizeEngine'
import ImageGallery from '@/components/product/ImageGallery'
```

---

## Environment Variables Reference

### Backend (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Development Workflow

```
Terminal 1 (Backend)
$ cd server
$ cp .env.example .env.local
$ npm install
$ npm run dev
→ Server: http://localhost:5000

Terminal 2 (Frontend)
$ cd client
$ cp .env.example .env.local
$ npm install
$ npm run dev
→ App: http://localhost:3000
```

---

## Production Build Output

### Backend
```
server/dist/           # Compiled JavaScript
server/package.json    # Installed dependencies
server/.env           # Production env vars
```

### Frontend
```
client/.next/         # Next.js build output
client/public/        # Static assets
```

---

## Quick Navigation Guide

| Need | File |
|------|------|
| Change colors | `client/tailwind.config.ts` |
| Add API endpoint | `server/src/routes/index.ts` |
| Modify product page | `client/app/product/[id]/ProductPage.tsx` |
| Update cart logic | `client/store/cartStore.ts` |
| Change API URL | `client/.env.local` |
| Fix database issue | `server/src/config/database.ts` |
| Add new component | `client/components/` (organize by section) |
| Add new API controller | `server/src/controllers/` |
| Update database schema | `server/src/models/` |
| Global styles | `client/styles/globals.css` |

---

## Deployment Checklist Files

- [ ] `server/.env.local` - Backend secrets
- [ ] `client/.env.local` - Frontend config
- [ ] `server/package.json` - Dependencies verified
- [ ] `client/package.json` - Dependencies verified
- [ ] `server/server.ts` - Port configured
- [ ] `client/next.config.ts` - Build optimized

---

**🎯 All files are organized, documented, and ready to use!**
