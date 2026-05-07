# Ahid Admin Panel

A fully functional, intuitive, and user-friendly admin system for the Ahid platform. Built with Next.js 16, React 19, Redux Toolkit, and Tailwind CSS.

## 🎨 Design Specifications

- **Primary Color**: #208E85
- **Typography**: Inter
- **Icons**: lucide-react and react-icons
- **UI Framework**: Tailwind CSS 4

## ✨ Features

### Authentication
- Secure JWT-based authentication
- Protected routes with role-based access control
- Session persistence with localStorage
- Auto-redirect based on auth state

### Dashboard
- Real-time statistics overview
- Total users, brands, posts, and categories
- Verified brands and active users metrics
- Pending verification tracking
- Recent activity feed (users and brands)

### Analytics
- **User Analytics**: Registration trends, verification status, top users by following count
- **Brand Analytics**: Registration trends, category distribution, top brands by followers, verification rates
- **Post Analytics**: Posting trends, most active brands, top posts by engagement

### Admin Management (Super Admin Only)
- Full CRUD operations for admin accounts
- Role management (Super Admin, Admin, Moderator)
- Granular permission system:
  - Manage Users
  - Manage Brands
  - Manage Categories
  - Manage Posts
  - View Analytics
  - Manage Admins
- Account activation/deactivation
- Last login tracking

### UI Components
- Responsive sidebar navigation
- Header with search and notifications
- Interactive charts (Line, Area, Bar, Pie)
- Stats cards with icons and trends
- Modal dialogs for forms
- Loading skeletons
- Error handling and display

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5000` (or configure in `.env.local`)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Copy `.env.local.example` to `.env.local` and update the API URL if needed:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/admin
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Framework**: Next.js 16.2.5 (App Router)
- **UI Library**: React 19.2.4
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React, React Icons
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Language**: TypeScript 5

## 📁 Project Structure

```
ahid-admin/
├── app/
│   ├── admins/              # Admin management page
│   ├── analytics/
│   │   ├── brands/          # Brand analytics
│   │   ├── posts/           # Post analytics
│   │   └── users/           # User analytics
│   ├── dashboard/           # Main dashboard
│   ├── login/               # Login page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirects)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── LoadingSkeleton.tsx
│       ├── Modal.tsx
│       └── StatsCard.tsx
├── contexts/
│   └── AuthContext.tsx      # Auth context provider
├── lib/
│   ├── features/
│   │   ├── admins/          # Admin API endpoints
│   │   ├── auth/            # Auth API & slice
│   │   ├── api/             # Base API slice
│   │   └── stats/           # Statistics API
│   ├── hooks.ts             # Redux hooks
│   ├── ReduxProvider.tsx    # Redux provider
│   └── store.ts             # Redux store configuration
├── public/
│   └── ahid_logo.png        # App logo
├── .env.local               # Environment variables
└── package.json
```

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Backend validates and returns JWT token + admin profile
3. Token and profile stored in localStorage
4. Token included in all API requests via Authorization header
5. Protected routes verify authentication and permissions
6. On logout, token is cleared and user redirected to login

## 🛡️ Permission System

### Roles
- **Super Admin**: Full access to all features including admin management
- **Admin**: Access to most features except admin management
- **Moderator**: Limited access based on assigned permissions

### Permissions
- `canManageUsers`: User management access
- `canManageBrands`: Brand management access
- `canManageCategories`: Category management access
- `canManagePosts`: Post/content management access
- `canViewAnalytics`: Analytics dashboard access
- `canManageAdmins`: Admin account management (Super Admin only)

## 📊 API Integration

All API endpoints are configured in `lib/features/`:

- **Auth**: `/login`, `/logout`, `/profile`
- **Admins**: `/admins` (GET, POST, PUT, DELETE)
- **Statistics**: 
  - `/stats/dashboard`
  - `/stats/users`
  - `/stats/brands`
  - `/stats/posts`

See `FRONTEND_API_DOCUMENTATION.md` for complete API specifications.

## 🎨 Customization

### Colors
Update CSS variables in `app/globals.css`:
```css
:root {
  --primary: #208E85;
  --primary-dark: #1a7269;
  --primary-light: #2ba599;
  /* ... */
}
```

### Navigation
Modify navigation items in `components/layout/Sidebar.tsx`:
```typescript
const navigation: NavItem[] = [
  // Add or remove navigation items
];
```

## 🧪 Testing

To test the admin panel:

1. Ensure backend is running on `http://localhost:5000`
2. Use default credentials (refer to backend documentation)
3. Test different roles and permissions

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api/admin` |

## 🐛 Troubleshooting

### Login Issues
- Verify backend is running and accessible
- Check API URL in `.env.local`
- Verify credentials with backend team

### Permission Errors
- Ensure user has required permissions
- Super Admin role required for admin management

### Chart Display Issues
- Clear browser cache
- Ensure data is being returned from API
- Check browser console for errors

## 📞 Support

For issues or questions:
- Check backend API documentation
- Review error messages in browser console
- Contact the development team

---

**Built with ❤️ for the Ahid Platform**

