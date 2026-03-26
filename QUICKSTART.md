# 🚀 Quick Start Guide

Get your production-ready e-commerce PDP up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- MongoDB installed locally or MongoDB Atlas account
- Git

## 1️⃣ Backend Setup (2 minutes)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `server/.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-key-here
CORS_ORIGIN=http://localhost:3000
```

Start the server:
```bash
npm run dev
```

✅ Server running: http://localhost:5000

## 2️⃣ Frontend Setup (2 minutes)

```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

✅ Frontend running: http://localhost:3000

## 3️⃣ Test the Application (1 minute)

1. Open http://localhost:3000/product/sample-product-id
2. Try the interactive features:
   - 🖼️ Image Gallery - hover to zoom, swipe on mobile
   - 🎨 Color Selector - click colors
   - 📏 Size Selector - toggle sizes
   - ✨ AI Size Modal - click "Get AI Size Recommendation"
   - ❤️ Wishlist - click heart icon
   - 🛒 Add to Cart - add items

## 📊 Sample API Endpoints

Test these in Postman or curl:

### Get Product
```bash
curl http://localhost:5000/api/product/123
```

### Get Size Recommendation
```bash
curl -X POST http://localhost:5000/api/size-recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "height": 175,
    "weight": 75,
    "unit": "metric",
    "bodyType": "regular",
    "fitPreference": "regular"
  }'
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

## 🐛 Troubleshooting

### "MongoDB connection error"
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env.local
- Try MongoDB Atlas: Update MONGODB_URI to your Atlas connection string

### "Port 5000/3000 already in use"
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Cannot find module errors"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API requests timing out
- Check if backend is running: http://localhost:5000/api/health
- Check NEXT_PUBLIC_API_URL in client/.env.local
- Check firewall settings

## 📁 Important Files

### Backend
- `server/server.ts` - Main server file
- `server/src/routes/index.ts` - All API routes
- `server/src/models/` - Database schemas
- `server/src/services/sizeRecommendation.service.ts` - AI logic

### Frontend
- `client/app/product/[id]/page.tsx` - Product page route
- `client/components/product/` - Product components
- `client/store/cartStore.ts` - Cart state
- `client/store/wishlistStore.ts` - Wishlist state

## 🎨 Customization

### Change Colors
Edit `client/tailwind.config.ts`:
```typescript
colors: {
  gray: {
    900: '#NewColor'
  }
}
```

### Change API URL
Edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-api-url.com
```

### Add New Endpoint
1. Add controller to `server/src/controllers/`
2. Add route to `server/src/routes/index.ts`
3. Call from frontend using `client/lib/api.ts`

## 📦 Build for Production

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
npm start
```

## 🚢 Deployment

### Frontend (Vercel - Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Railway/Heroku)
```bash
# Create app and deploy
# Set environment variables in your platform
# Platform will detect Node.js and auto-run npm start
```

## 📚 Learn More

- [DELIVERABLES.md](./DELIVERABLES.md) - Complete feature list
- [README.md](./README.md) - Full documentation
- [server/README.md](./server/README.md) - Backend docs
- [client/README.md](./client/README.md) - Frontend docs

## ⚡ Performance Tips

1. **Images**: Use WebP format (Next/Image handles this)
2. **Database**: Add indexes for frequently queried fields
3. **Cache**: Implement Redis for rate limiting
4. **CDN**: Use Cloudflare for image delivery
5. **Monitoring**: Set up Sentry for error tracking

## 💡 Next Features to Add

- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Product search & filters
- [ ] Checkout flow
- [ ] Order tracking
- [ ] User reviews with images
- [ ] Admin dashboard
- [ ] Analytics

## 🎯 Common Tasks

### Add a Product to Database

```javascript
// Using MongoDB directly or Mongoose
const product = new Product({
  name: "Premium Blazer",
  brand: "Designer Brand",
  description: "A sophisticated blazer...",
  category: "blazers",
  basePrice: 299.99,
  discountPrice: 199.99,
  images: [{
    url: "https://example.com/image.jpg",
    alt: "Blazer",
    isPrimary: true
  }],
  // ... other fields
});
await product.save();
```

### Create a Test User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456",
    "confirmPassword": "test123456"
  }'
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Monitor for suspicious activity

## 📱 Testing on Mobile

```bash
# Get your machine IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig               # Windows

# Access from mobile device
http://YOUR_IP:3000/product/123
```

## 🆘 Need Help?

1. Check the [DELIVERABLES.md](./DELIVERABLES.md) for complete docs
2. Review inline code comments
3. Check console/terminal for error messages
4. Verify environment variables are set
5. Test API endpoints independently

---

**🎉 You're all set! Happy coding!**

For production deployment, remember to:
- Enable HTTPS
- Set up proper logging
- Configure CI/CD pipeline
- Set up database backups
- Monitor performance
