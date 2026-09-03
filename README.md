# Next-Gen Dark Mode Super App

A comprehensive service marketplace platform built with Next.js 14, featuring multiple service categories and a complete booking flow.

## Features

- 🏠 **Landing Page**: Beautiful hero section with service cards
- 🔧 **Service Provider Flow**: Complete booking flow for appliances, PG/hostels, religious services, spa/salon, and more
- 🛒 **Shopping Cart**: Full cart functionality with address selection
- 📱 **Responsive Design**: Mobile-first, fully responsive UI
- 🎨 **Dark Mode**: Modern dark theme with glassmorphism effects
- ⚡ **Performance**: Optimized with Next.js 14 App Router

## Service Routes

- `/services/appliances` - Appliance repair services
- `/services/pg-hostel` - PG and hostel accommodations
- `/services/religious` - Religious services
- `/services/spa-salon` - Spa and salon services
- `/services/daily-needs` - Daily needs delivery
- `/services/medicine` - Medicine delivery
- `/services/parcel` - Parcel services

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=https://devapis.doorstephub.com/v1/dhubApi
NEXT_PUBLIC_API_ALL_SERVICES_ENDPOINT=/app/applience-repairs-website/all-services
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── page.js              # Landing page
│   ├── layout.js            # Root layout
│   ├── services/
│   │   └── [slug]/          # Dynamic service routes
│   └── not-found.js         # 404 page
├── src/
│   ├── components/          # Reusable components
│   ├── provider/            # Service provider flow
│   └── styles/              # Global styles
└── public/                  # Static assets
```

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Notifications**: Sonner

## API Integration

The app integrates with the DoorstepHub API:
- Service listing: `GET /app/applience-repairs-website/all-services`
- All API calls include proper error handling and loading states

## Error Handling

- ✅ API error handling with retry functionality
- ✅ 404 page for invalid routes
- ✅ Loading states for better UX
- ✅ Error boundaries (recommended to add)

## Performance Optimizations

- Static generation for service routes
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Lazy loading for components

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include loading states
4. Test on multiple devices
5. Update documentation

## License

Private project - All rights reserved
