# StepVision Hotel Supplies Website

A Next.js 14 website for StepVision Hotel Supplies, featuring a comprehensive product catalog and quote request system for B2B hospitality clients in the UAE.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens
- **State Management**: Zustand (for quote cart)
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **Data**: MongoDB (Mongoose), validated with Zod
- **Auth**: short-lived JWT access token + rotating refresh token (both httpOnly cookies) and a revocable session per device

## 🔌 Server (no separate backend)

Everything runs inside the Next.js app in `frontend/`. Copy `frontend/.env.local.example` to `frontend/.env.local` and fill it in.

```
src/server/
├── env.ts, db.ts        # settings and the shared MongoDB connection
├── models/              # Mongoose models (field limits live here)
├── schemas/             # Zod input validation
├── auth/                # JWT (token.ts) and login sessions (session.ts)
├── services/            # business logic, used by routes, actions and pages
├── actions/             # server actions: login/logout, add/edit/delete
├── http.ts              # apiRoute/adminRoute and runAction/runAdminAction wrappers
└── uploads.ts           # product images (saved as WebP in ./uploads)
```

- **Reads** are API routes (GET): `/api/catalog/*` (public), `/api/admin/*` (login required), `/api/health`.
- **Changes** are server actions in `src/server/actions/`. Each one checks the login, then validates its input.
- Server components (home page, `/admin`) call the services directly.

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Setup Instructions

1. **Clone and navigate to the project**:
   ```bash
   cd stepvision-hotel-supplies
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with Header/Footer
│   ├── page.tsx                 # Home page (stub)
│   ├── products/                # Product routes
│   │   ├── page.tsx            # Products listing (stub)
│   │   ├── [category]/         # Category pages
│   │   │   ├── page.tsx        # Category listing (stub)
│   │   │   └── [productId]/    # Product detail pages
│   │   │       └── page.tsx    # Product detail (stub)
│   ├── about/                   # About page (coming soon)
│   ├── why-choose-us/          # Why Choose Us (coming soon)
│   ├── contact/                # Contact page (coming soon)
│   ├── request-catalogue/      # Request Catalogue (coming soon)
│   └── quote-cart/             # Quote Cart (coming soon)
├── components/                  # Reusable components
│   ├── Button.tsx              # Button component (3 variants)
│   ├── Card.tsx                # Card container component
│   ├── ProductCard.tsx         # Product display card
│   ├── CategoryCard.tsx        # Category display card
│   └── layout/                 # Layout components
│       ├── Header.tsx          # Header with nav & mega-menu
│       └── Footer.tsx          # Footer with links & contact
├── data/                        # Data layer
│   ├── types.ts                # TypeScript interfaces
│   ├── categories.json         # 12 main categories
│   ├── products.json           # 30 sample products
│   └── helpers.ts              # Data access functions
├── store/                       # State management
│   └── useQuoteCart.ts         # Zustand quote cart store
└── styles/                      # Styling
    └── design-tokens.css       # Design system tokens
```

## 🎨 Design System

The design system is defined in `src/styles/design-tokens.css` with:

- **Colors**: Professional B2B palette (primary teal, secondary gold, neutral grays)
- **Typography**: Inter font family with clear hierarchy
- **Spacing**: 4px base scale (xs to 5xl)
- **Shadows**: Subtle elevation system
- **Breakpoints**: Mobile-first (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

### Using Design Tokens

Access tokens via CSS variables:
```css
.my-element {
  color: var(--color-primary-600);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
}
```

Or use Tailwind classes with the extended theme configuration.

## 🗂️ Data Structure

### Categories
12 main categories with subcategories:
- Tabletop & Dining
- Kitchen & Catering
- Housekeeping & Cleaning
- Guest Room Essentials
- Front Office & Service
- Engineering Products
- Stationery
- Gift Items
- Party Items
- Furniture
- Upholstery
- Custom & Project Solutions

### Products
30 sample products with:
- Product name, code, category
- Brand, description
- Images (Unsplash placeholders)
- Featured flag
- Active/archived status

### Data Access
Use helper functions from `src/data/helpers.ts`:
```typescript
import { getCategories, getProducts, getFeaturedProducts } from '@/data/helpers';

const categories = getCategories();
const products = getProducts();
const featured = getFeaturedProducts();
```

## 🛒 Quote Cart

The quote cart uses Zustand for state management with localStorage persistence.

### Usage
```typescript
import { useQuoteCart } from '@/store/useQuoteCart';

function MyComponent() {
  const { items, addItem, removeItem, getTotalItems } = useQuoteCart();
  
  const handleAdd = () => {
    addItem({
      productId: 'prod-1',
      productName: 'Product Name',
      productCode: 'CODE-001',
      imageUrl: '/image.jpg'
    }, 2); // quantity
  };
}
```

## 🧩 Components

### Button
```tsx
<Button variant="primary" size="md">Click Me</Button>
<Button variant="secondary" size="lg">Secondary</Button>
<Button variant="outline" size="sm">Outline</Button>
```

### Card
```tsx
<Card padding="md" shadow="lg" hover>
  Content here
</Card>
```

### ProductCard
```tsx
<ProductCard product={productData} />
```

### CategoryCard
```tsx
<CategoryCard category={categoryData} />
```

## 🚦 Available Routes

- `/` - Home page (stub for next agent)
- `/products` - Products listing (stub for next agent)
- `/products/[category]` - Category page (stub for next agent)
- `/products/[category]/[productId]` - Product detail (stub for next agent)
- `/about` - About Us (coming soon)
- `/why-choose-us` - Why Choose Us (coming soon)
- `/contact` - Contact (coming soon)
- `/request-catalogue` - Request Catalogue (coming soon)
- `/quote-cart` - Quote Cart (coming soon)

## 📝 Development Notes

### For the Next Agent
The foundation is complete with:
- ✅ Global layout (Header + Footer)
- ✅ Navigation with mega-menu
- ✅ Design system and tokens
- ✅ Data layer with 12 categories and 30 products
- ✅ Quote cart state management
- ✅ Reusable components
- ✅ All route structure

**Ready for implementation**:
- Home page with hero, featured products, categories
- Products listing with filters and search
- Category pages with product grids
- Product detail pages with full information

## 🔧 Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 📦 Dependencies

### Core
- `next@14.2.35`
- `react@^18`
- `react-dom@^18`
- `typescript@^5`

### UI & Styling
- `tailwindcss@^3`
- `lucide-react@^0.468.0`

### State Management
- `zustand@^5.0.2`

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

Proprietary - StepVision Hotel Supplies

## 📧 Contact

- **Email**: sales@stepvisionhotelsupplies.com
- **Phone**: 056 897 8100
- **Location**: United Arab Emirates
