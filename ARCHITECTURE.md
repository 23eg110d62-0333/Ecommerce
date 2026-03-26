# 🏗️ Architecture & Design Document

## System Overview

This is a modern, scalable e-commerce platform built with a microservices-ready architecture. The frontend and backend are completely decoupled and can scale independently.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Next.js 14)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Components (TSX)                   │   │
│  │  ┌─────────────┬──────────────┬─────────────┐        │   │
│  │  │   Product   │  Image       │   Reviews   │        │   │
│  │  │   Gallery   │  Component   │  Component  │        │   │
│  │  └─────────────┴──────────────┴─────────────┘        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │           Zustand State Management                    │   │
│  │     (Cart Store, Wishlist Store, UI State)           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │         Tailwind CSS + Framer Motion                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST API
                             │ (Next.js API Routes)
┌────────────────────────────▼────────────────────────────────┐
│              Server (Node.js + Express)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         API Routes & Controllers                      │   │
│  │  ┌──────────┬──────────┬──────────┬─────────┐        │   │
│  │  │ Product  │  Reviews │ Cart     │ Auth    │        │   │
│  │  │ Routes   │ Routes   │ Routes   │ Routes  │        │   │
│  │  └──────────┴──────────┴──────────┴─────────┘        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │        Middleware Stack                               │   │
│  │  ┌─────────────────────────────────────────┐        │   │
│  │  │ JWT Auth │ Validation │ Error Handler   │        │   │
│  │  │ Rate Limit │ Logger    │ CORS            │        │   │
│  │  └─────────────────────────────────────────┘        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │         Business Logic Services                       │   │
│  │  ┌──────────────────────────────────────┐            │   │
│  │  │  Size Recommendation Engine (AI)      │            │   │
│  │  │  Product Aggregation                  │            │   │
│  │  │  Review Management                    │            │   │
│  │  └──────────────────────────────────────┘            │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │         Data Access Layer (Mongoose)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ MongoDB Protocol
                             │
┌────────────────────────────▼────────────────────────────────┐
│                Database (MongoDB)                            │
│  ┌──────────┬──────────┬──────────┬────────┬────────┐      │
│  │ Products │  Users   │ Reviews  │ Carts  │Wishlists       │
│  └──────────┴──────────┴──────────┴────────┴────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Architecture

### Product Detail Page Flow

```
1. USER NAVIGATES TO /product/[id]
   │
   ├─→ Next.js Router matches [id] parameter
   │
   ├─→ Server Component (page.tsx)
   │   │
   │   ├─→ Calls API: GET /api/product/{id}
   │   │
   │   ├─→ Generates Metadata (SEO)
   │   │   ├─ Title, Description
   │   │   ├─ Open Graph tags
   │   │   └─ Twitter Card
   │   │
   │   └─→ Returns Product Data + JSX
   │
   ├─→ Browser renders ProductPage Component
   │   │
   │   ├─→ ImageGallery Component
   │   │   ├─ Shows large image with zoom
   │   │   ├─ Thumbnail strip
   │   │   └─ Mobile touch handlers
   │   │
   │   ├─→ ProductInfo Component
   │   │   ├─ Price display
   │   │   ├─ Rating stars
   │   │   ├─ Color selector
   │   │   ├─ Size selector
   │   │   └─ Quantity controls
   │   │
   │   └─→ Tabbed Sections (lazy loaded)
   │       ├─ Details Tab
   │       ├─ Sizing Tab
   │       ├─ Reviews Tab
   │       └─ Complete the Look Tab
   │
   └─→ USER INTERACTIONS:
       ├─ Click Color
       ├─ Select Size
       ├─ Click "Get AI Size Recommendation"
       │   └─ AISizeModal Opens
       │   └─ Calls getSizeRecommendation()
       │   └─ Displays Result
       ├─ Set Quantity
       ├─ Click "Add to Cart"
       │   └─ Updates Zustand Store
       │   └─ Shows Toast
       └─ Click Heart (Wishlist)
           └─ Toggles Wishlist
```

## 🏛️ Directory Structure Deep Dive

### Frontend Structure

```
client/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── providers.tsx           # ThemeProvider wrapper
│   ├── globals.css             # Global Tailwind + custom CSS
│   │
│   └── product/[id]/
│       ├── page.tsx            # SSR page (server component)
│       ├── ProductPage.tsx     # Client component with UI
│       └── loading.tsx         # Suspense fallback
│
├── components/
│   ├── product/
│   │   ├── ImageGallery.tsx              # Image viewer + zoom
│   │   ├── ProductInfo.tsx               # Main product info
│   │   ├── SizeSelector.tsx              # Size buttons
│   │   ├── AISizeModal.tsx              # AI recommendation
│   │   ├── ColorSelector.tsx             # Color swatches
│   │   ├── QuantitySelector.tsx          # Qty +/- buttons
│   │   ├── ActionButtons.tsx             # Add to cart etc
│   │   └── LiveIndicators.tsx            # Viewer count
│   │
│   ├── tabs/
│   │   ├── ProductDetails.tsx            # Materials, care
│   │   ├── SizeFitGuide.tsx             # Measurement table
│   │   ├── ReviewsSection.tsx           # Reviews + filters
│   │   ├── CompleteTheLook.tsx          # Outfit suggestions
│   │   └── RelatedProducts.tsx          # Similar items
│   │
│   └── ui/
│       ├── SkeletonLoader.tsx            # Loading states
│       ├── StarRating.tsx                # Reusable stars
│       ├── Toast.tsx                     # Notifications
│       └── DarkModeToggle.tsx           # Theme toggle
│
├── store/
│   ├── cartStore.ts            # Zustand cart logic
│   └── wishlistStore.ts        # Zustand wishlist logic
│
├── lib/
│   ├── api.ts                  # API helper functions
│   └── sizeEngine.ts           # Client-side size logic
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── styles/
│   └── globals.css             # Tailwind + custom styles
│
├── hooks/
│   ├── useProduct.ts           # Product data hook
│   ├── useSwipeGesture.ts      # Touch handling
│   └── useViewerCount.ts       # Live count simulation
│
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── postcss.config.js           # PostCSS config
├── package.json                # Dependencies
└── .env.example                # Environment template
```

### Backend Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts         # MongoDB connection
│   │   └── constants.ts        # App constants
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification
│   │   ├── errorHandler.ts     # Error handling
│   │   └── validation.ts       # Input validation
│   │
│   ├── models/
│   │   ├── User.model.ts       # User schema
│   │   ├── Product.model.ts    # Product schema
│   │   ├── Review.model.ts     # Review schema
│   │   ├── Cart.model.ts       # Cart schema
│   │   └── Wishlist.model.ts   # Wishlist schema
│   │
│   ├── controllers/
│   │   ├── index.ts            # Product & Auth controllers
│   │   ├── cart.controller.ts  # Cart & Wishlist logic
│   │   └── sizeRecommendation.controller.ts
│   │
│   ├── routes/
│   │   └── index.ts            # All API routes
│   │
│   ├── services/
│   │   ├── sizeRecommendation.service.ts  # AI logic
│   │   ├── email.service.ts    # Email (future)
│   │   └── upload.service.ts   # Image upload (future)
│   │
│   └── utils/
│       ├── validators.ts       # Validation helpers
│       ├── formatters.ts       # Data formatters
│       └── helpers.ts          # Utility functions
│
├── server.ts                   # Express app setup
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
└── .prettierrc                 # Prettier config
```

## 🔄 State Management Flow

### Cart State with Zustand

```
User Action (Click "Add to Cart")
    ↓
ProductPage Component
    ├─ Validates: size selected?
    ├─ Creates CartItem object
    └─ Calls: addItem(cartItem)
    ↓
useCartStore.addItem()
    ├─ Check if item already exists
    ├─ If exists: merge quantities
    ├─ If new: append to cart
    ├─ Calculate totals
    ├─ Persist to localStorage
    └─ Return updated state
    ↓
Component re-renders with updated cart
    ├─ Show success toast
    ├─ Update cart icon badge
    └─ Enable checkout button
```

### Server State Sync

```
User Logs In
    ↓
Backend validates JWT
    ↓
GET /api/cart called
    ├─ Fetch cart from DB
    ├─ Populate product details
    └─ Return full cart
    ↓
Frontend receives cart data
    ├─ cartStore.syncCart(data)
    ├─ Merge with localStorage
    └─ Display to user
```

## 🌐 API Endpoints Architecture

### RESTful Design Pattern

```
PRODUCTS
├── GET /api/product/:id                    # Fetch product
├── GET /api/products/related?category=...  # Related products

REVIEWS
├── GET /api/reviews/:productId?...         # List reviews
└── POST /api/reviews                       # Create review (auth)

SIZE RECOMMENDATION
└── POST /api/size-recommendation           # Get size suggestion

CART (Authenticated)
├── POST /api/cart                          # Add item
├── GET /api/cart                           # Get cart
├── PUT /api/cart/item                      # Update item
└── DELETE /api/cart                        # Clear cart

WISHLIST (Authenticated)
├── POST /api/wishlist                      # Toggle item
├── GET /api/wishlist                       # Get wishlist
└── DELETE /api/wishlist                    # Clear wishlist

AUTHENTICATION
├── POST /api/auth/register                 # Create user
└── POST /api/auth/login                    # Login

USER PROFILE (Authenticated)
├── GET /api/user/profile                   # Get profile
└── PUT /api/user/profile                   # Update profile

HEALTH
└── GET /api/health                         # Server status
```

## 🔐 Authentication Flow

```
CLIENT SIDE:
1. User fills registration form
2. Submit to /api/auth/register
3. Receive JWT token
4. Store in localStorage
5. Include in future requests:
   Authorization: Bearer {token}

SERVER SIDE:
1. Register endpoint validates input
2. Hash password with bcryptjs
3. Save user to MongoDB
4. Generate JWT token
5. Return token to client

SUBSEQUENT REQUESTS:
1. Client includes token in header
2. Middleware verifies token
3. Extract userId from token
4. Attach to req.user
5. Controller uses req.user for authorization
```

## 📈 Scalability Considerations

### Current Implementation
- ✅ Stateless servers (easily scalable)
- ✅ JWT auth (no session storage)
- ✅ Database indexing on key fields
- ✅ Rate limiting per IP

### Future Scalability
- Redis caching layer for frequently accessed products
- Database read replicas for reports
- CDN for static assets
- Message queue (RabbitMQ) for async jobs
- Microservices separation (cart service, order service, etc.)

### Database Indexing

```javascript
// Indices created automatically by Mongoose:
Product: { slug: 1, category: 1, tags: 1, brand: 1 }
Review: { productId: 1, rating: 1, userId: 1, createdAt: -1 }
Cart: { userId: 1 }
Wishlist: { userId: 1, items.productId: 1 }
```

## 🎯 Performance Optimization Strategy

### Frontend
1. **Image Optimization**
   - Next/Image component
   - Automatic AVIF/WebP conversion
   - Lazy loading below-the-fold

2. **Code Splitting**
   - Dynamic imports for tab content
   - Modal component lazy loaded

3. **Caching**
   - localStorage for cart/wishlist
   - Browser cache headers
   - ISR for product pages (1 hour)

### Backend
1. **Database**
   - Indexes on frequently queried fields
   - Lean queries when possible
   - Connection pooling

2. **Response Optimization**
   - Field selection in queries
   - Pagination for large datasets
   - Compression (gzip)

3. **Caching Strategy**
   - Cache product data (1 hour)
   - Cache related products (6 hours)
   - Invalidate on updates

## 🧪 Testing Strategy

### Unit Tests (Frontend)
```
- Component rendering
- State management
- Event handlers
```

### Integration Tests (Backend)
```
- API endpoint functionality
- Database operations
- Authentication flow
```

### E2E Tests
```
- Complete user journey
- Cart addition
- Review submission
- Size recommendation
```

## 🚀 Deployment Strategy

### Development
```
localhost:3000 (Next.js dev)
localhost:5000 (Express dev)
localhost:27017 (MongoDB)
```

### Staging
```
Frontend: Vercel Preview
Backend: Railway/Heroku Staging
Database: MongoDB Atlas Staging
```

### Production
```
Frontend: Vercel Production
Backend: Railway/Heroku Production
Database: MongoDB Atlas Production
CDN: Cloudflare
Monitoring: Sentry, LogRocket
```

---

## 📚 Design Patterns Used

1. **Component Pattern**: Reusable React components
2. **Container/Presenter**: Smart/dumb components
3. **Hook Pattern**: Custom React hooks for logic
4. **Service Pattern**: Business logic in services
5. **Factory Pattern**: Creating cart/wishlist items
6. **Middleware Pattern**: Express middleware stack
7. **Repository Pattern**: Mongoose models
8. **Singleton Pattern**: Database connection

---

This architecture provides a solid foundation for scaling to millions of users while maintaining clean, maintainable code.
