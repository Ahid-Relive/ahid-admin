# Admin Backend API Documentation for Frontend Integration

**Version**: 1.0.0  
**Last Updated**: May 7, 2026  
**Base URL**: `http://your-domain.com/api/admin`

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Security Considerations](#security-considerations)
7. [Rate Limiting](#rate-limiting)
8. [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

This document provides complete API specifications for building the admin frontend application. The admin system includes authentication, admin management, and comprehensive analytics dashboards.

### Key Features
- Multi-role authentication (Super Admin, Admin, Moderator)
- Granular permission system
- Dashboard with real-time statistics
- User and brand analytics
- Post/content analytics
- Admin account management
- Audit logging

### Base URL
```
Production: https://your-api.com/api/admin
Development: http://localhost:5000/api/admin
```

---

## Authentication

### Authentication Flow

```
1. User enters email and password
   ↓
2. POST /api/admin/login
   ↓
3. Backend returns JWT token + admin profile
   ↓
4. Store token in localStorage/sessionStorage
   ↓
5. Include token in all subsequent requests:
   Authorization: Bearer {token}
   ↓
6. On logout, POST /api/admin/logout
   ↓
7. Clear stored token
```

### Token Details
- **Type**: JWT (JSON Web Token)
- **Expiry**: 7 days
- **Storage**: Store in `localStorage` or secure cookie
- **Header**: `Authorization: Bearer {token}`

### Login Endpoint

#### POST `/login`

**Description**: Authenticate admin user and receive JWT token.

**Rate Limit**: 5 attempts per 15 minutes per IP

**Request Body**:
```json
{
  "email": "admin@ahid.com",
  "password": "Admin@123!"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@ahid.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "super_admin",
    "permissions": {
      "canManageUsers": true,
      "canManageBrands": true,
      "canManageCategories": true,
      "canManagePosts": true,
      "canViewAnalytics": true,
      "canManageAdmins": true
    }
  }
}
```

**Error Responses**:
```json
// 400 - Missing fields
{
  "success": false,
  "message": "Email and password are required."
}

// 401 - Invalid credentials
{
  "success": false,
  "message": "Invalid credentials."
}

// 403 - Account deactivated
{
  "success": false,
  "message": "Admin account is deactivated. Contact super admin."
}

// 429 - Account locked
{
  "success": false,
  "message": "Account temporarily locked due to multiple failed login attempts. Try again later."
}

// 429 - Rate limited
{
  "success": false,
  "message": "Too many login attempts. Please try again after 15 minutes.",
  "retryAfter": "900 seconds"
}
```

**Frontend Implementation**:
```javascript
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminProfile', JSON.stringify(data.admin));
      
      // Redirect to dashboard
      window.location.href = '/admin/dashboard';
    } else {
      // Show error message
      alert(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
}
```

### Logout Endpoint

#### POST `/logout`

**Description**: Invalidate current session token.

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Frontend Implementation**:
```javascript
async function logout() {
  const token = localStorage.getItem('adminToken');
  
  try {
    await fetch('http://localhost:5000/api/admin/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
    window.location.href = '/admin/login';
  }
}
```

### Get Current Admin Profile

#### GET `/profile`

**Description**: Retrieve authenticated admin's profile.

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@ahid.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "super_admin",
    "permissions": {
      "canManageUsers": true,
      "canManageBrands": true,
      "canManageCategories": true,
      "canManagePosts": true,
      "canViewAnalytics": true,
      "canManageAdmins": true
    },
    "isActive": true,
    "lastLogin": "2026-05-07T10:30:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## API Endpoints

### Admin Management (Super Admin Only)

#### GET `/admins`

**Description**: Get list of all admin accounts.

**Permission Required**: Super Admin only

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "superadmin@ahid.com",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "super_admin",
      "permissions": {
        "canManageUsers": true,
        "canManageBrands": true,
        "canManageCategories": true,
        "canManagePosts": true,
        "canViewAnalytics": true,
        "canManageAdmins": true
      },
      "isActive": true,
      "lastLogin": "2026-05-07T10:30:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-05-07T10:30:00.000Z"
    }
  ]
}
```

**UI Suggestion**: Display as table with columns: Name, Email, Role, Status (Active/Inactive), Last Login, Actions

#### POST `/admins`

**Description**: Create new admin account.

**Permission Required**: Super Admin only

**Headers**: 
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "newadmin@ahid.com",
  "password": "SecurePass@123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "permissions": {
    "canManageUsers": true,
    "canManageBrands": true,
    "canManageCategories": true,
    "canManagePosts": true,
    "canViewAnalytics": true,
    "canManageAdmins": false
  }
}
```

**Field Validation**:
- `email`: Required, valid email format
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number, special char
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `role`: Optional, one of: `super_admin`, `admin`, `moderator` (default: `admin`)
- `permissions`: Optional object with boolean values

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Admin created successfully.",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "email": "newadmin@ahid.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "admin",
    "permissions": {
      "canManageUsers": true,
      "canManageBrands": true,
      "canManageCategories": true,
      "canManagePosts": true,
      "canViewAnalytics": true,
      "canManageAdmins": false
    }
  }
}
```

**Error Responses**:
```json
// 400 - Validation error
{
  "success": false,
  "message": "Password must be minimum 8 characters with at least one uppercase, one lowercase, one number, and one special character."
}

// 409 - Email already exists
{
  "success": false,
  "message": "Admin with this email already exists."
}
```

**Form Fields for UI**:
```javascript
const formFields = {
  email: { type: 'email', required: true, label: 'Email Address' },
  password: { type: 'password', required: true, label: 'Password', 
    hint: 'Min 8 chars, uppercase, lowercase, number, special char' },
  firstName: { type: 'text', required: true, label: 'First Name', 
    minLength: 2, maxLength: 50 },
  lastName: { type: 'text', required: true, label: 'Last Name', 
    minLength: 2, maxLength: 50 },
  role: { type: 'select', required: true, label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'super_admin', label: 'Super Admin' }
    ]
  },
  permissions: { type: 'checkboxGroup', label: 'Permissions',
    options: [
      { key: 'canManageUsers', label: 'Manage Users' },
      { key: 'canManageBrands', label: 'Manage Brands' },
      { key: 'canManageCategories', label: 'Manage Categories' },
      { key: 'canManagePosts', label: 'Manage Posts' },
      { key: 'canViewAnalytics', label: 'View Analytics' },
      { key: 'canManageAdmins', label: 'Manage Admins' }
    ]
  }
};
```

#### PUT `/admins/:id`

**Description**: Update existing admin account.

**Permission Required**: Super Admin only

**Note**: Cannot modify your own account using this endpoint.

**Headers**: 
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "moderator",
  "permissions": {
    "canManageUsers": false,
    "canViewAnalytics": true
  },
  "isActive": false
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Admin updated successfully.",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "email": "admin@ahid.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "moderator",
    "permissions": {
      "canManageUsers": false,
      "canManageBrands": true,
      "canManageCategories": true,
      "canManagePosts": true,
      "canViewAnalytics": true,
      "canManageAdmins": false
    },
    "isActive": false
  }
}
```

**Error Responses**:
```json
// 400 - Trying to modify own account
{
  "success": false,
  "message": "You cannot modify your own account. Use profile update instead."
}

// 400 - Trying to demote/deactivate last super admin
{
  "success": false,
  "message": "Cannot demote the last active super admin."
}

// 404 - Admin not found
{
  "success": false,
  "message": "Admin not found."
}
```

#### DELETE `/admins/:id`

**Description**: Permanently delete admin account.

**Permission Required**: Super Admin only

**Note**: Cannot delete yourself or the last super admin.

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Admin deleted successfully."
}
```

**Error Responses**:
```json
// 400 - Trying to delete yourself
{
  "success": false,
  "message": "You cannot delete your own account."
}

// 400 - Trying to delete last super admin
{
  "success": false,
  "message": "Cannot delete the last super admin."
}
```

**UI Confirmation Dialog**:
```javascript
// Show confirmation before deletion
if (confirm(`Are you sure you want to delete ${admin.firstName} ${admin.lastName}? This action cannot be undone.`)) {
  await deleteAdmin(adminId);
}
```

---

### Statistics & Analytics

#### GET `/stats/dashboard`

**Description**: Get overview statistics for dashboard.

**Permission Required**: `canViewAnalytics`

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalBrands": 340,
      "totalPosts": 5600,
      "totalCategories": 22,
      "verifiedBrands": 255,
      "activeUsers": 980,
      "pendingVerification": 85
    },
    "recentActivity": {
      "recentUsers": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "User",
          "email": "john@example.com",
          "createdAt": "2026-05-07T09:00:00.000Z"
        }
      ],
      "recentBrands": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Fashion Brand",
          "brand_email": "brand@example.com",
          "verified": "true",
          "createdAt": "2026-05-07T08:30:00.000Z"
        }
      ]
    }
  }
}
```

**Dashboard UI Components**:

1. **Stats Cards** (Grid Layout):
```javascript
const statsCards = [
  { title: 'Total Users', value: data.overview.totalUsers, icon: 'users', color: 'blue' },
  { title: 'Total Brands', value: data.overview.totalBrands, icon: 'building', color: 'green' },
  { title: 'Total Posts', value: data.overview.totalPosts, icon: 'file', color: 'purple' },
  { title: 'Verified Brands', value: data.overview.verifiedBrands, icon: 'check-circle', color: 'teal' },
  { title: 'Active Users', value: data.overview.activeUsers, icon: 'user-check', color: 'orange' },
  { title: 'Pending Verification', value: data.overview.pendingVerification, icon: 'clock', color: 'red' },
];
```

2. **Recent Activity Tables**:
   - Recent Users (show: Name, Email, Join Date)
   - Recent Brands (show: Name, Email, Verification Status, Join Date)

#### GET `/stats/users`

**Description**: Get detailed user statistics with trends.

**Permission Required**: `canViewAnalytics`

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "verifiedUsers": 980,
      "unverifiedUsers": 270,
      "usersWithAddresses": 850
    },
    "registrationTrend": [
      {
        "_id": { "year": 2026, "month": 1 },
        "count": 150
      },
      {
        "_id": { "year": 2026, "month": 2 },
        "count": 180
      },
      {
        "_id": { "year": 2026, "month": 3 },
        "count": 220
      }
    ],
    "topUsers": [
      {
        "id": "507f1f77bcf86cd799439015",
        "name": "John Doe",
        "email": "john@example.com",
        "followingCount": 45
      }
    ]
  }
}
```

**Chart Suggestions**:

1. **User Overview Cards**:
   - Total Users (large)
   - Verified vs Unverified (pie chart)
   - Users with Addresses (percentage)

2. **Registration Trend**:
   - Line chart showing registrations over last 6 months
   - X-axis: Month/Year
   - Y-axis: Number of registrations

3. **Top Users Table**:
   - Columns: Name, Email, Brands Following
   - Sort by following count

**Chart Library Recommendation**: Chart.js, Recharts, or Apache ECharts

#### GET `/stats/brands`

**Description**: Get detailed brand statistics.

**Permission Required**: `canViewAnalytics`

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBrands": 340,
      "verifiedBrands": 255,
      "pendingVerification": 85,
      "verificationRate": "75.00"
    },
    "registrationTrend": [
      {
        "_id": { "year": 2026, "month": 1 },
        "count": 45
      }
    ],
    "categoryDistribution": [
      {
        "_id": "Fashion & Apparel",
        "count": 78
      },
      {
        "_id": "Beauty & Cosmetics",
        "count": 56
      },
      {
        "_id": "Food & Beverage",
        "count": 42
      }
    ],
    "topBrands": [
      {
        "id": "507f1f77bcf86cd799439016",
        "name": "Fashion Hub",
        "email": "fashion@example.com",
        "category": "Fashion & Apparel",
        "verified": "true",
        "followerCount": 1250
      }
    ]
  }
}
```

**Chart Suggestions**:

1. **Brand Overview**:
   - Verification rate (progress bar or gauge)
   - Verified vs Pending (donut chart)

2. **Category Distribution**:
   - Horizontal bar chart
   - Top 10 categories by brand count

3. **Registration Trend**:
   - Area chart showing brand registrations over time

4. **Top Brands**:
   - Table with: Name, Category, Verified Status, Followers
   - Badge for verified status

#### GET `/stats/posts`

**Description**: Get post/update statistics.

**Permission Required**: `canViewAnalytics`

**Headers**: 
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPosts": 5600
    },
    "postingTrend": [
      {
        "_id": { "year": 2026, "month": 1 },
        "count": 850
      }
    ],
    "topPosts": [
      {
        "id": "507f1f77bcf86cd799439017",
        "description": "Check out our new summer collection! 🌞 #Fashion...",
        "imageCount": 3,
        "likesCount": 245,
        "dislikesCount": 5,
        "brand": {
          "_id": "507f1f77bcf86cd799439018",
          "name": "Fashion Hub",
          "profile": "https://example.com/profile.jpg"
        },
        "createdAt": "2026-05-06T10:30:00.000Z"
      }
    ],
    "mostActiveBrands": [
      {
        "brand": {
          "_id": "507f1f77bcf86cd799439019",
          "name": "Fashion Hub",
          "profile": "https://example.com/profile.jpg",
          "category": "Fashion & Apparel"
        },
        "postCount": 156
      }
    ]
  }
}
```

**Chart Suggestions**:

1. **Posting Trend**:
   - Line chart showing posts over last 6 months

2. **Top Posts**:
   - Card layout with:
     - Thumbnail/first image
     - Truncated description
     - Like/dislike counts
     - Brand info
     - Post date

3. **Most Active Brands**:
   - Bar chart: Brand name vs Post count
   - Show top 10

---

## Data Models

### Admin Model

```typescript
interface Admin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    canManageUsers: boolean;
    canManageBrands: boolean;
    canManageCategories: boolean;
    canManagePosts: boolean;
    canViewAnalytics: boolean;
    canManageAdmins: boolean;
  };
  isActive: boolean;
  lastLogin: string; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### User Model (Summary)

```typescript
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile: string; // URL
  isEmailVerified: boolean;
  brand_following: string[]; // Brand IDs
  createdAt: string;
}
```

### Brand Model (Summary)

```typescript
interface Brand {
  _id: string;
  name: string;
  brand_email: string;
  category: string;
  verified: string; // "true" or "false"
  profile: string; // URL
  brand_follower: string[]; // User IDs
  createdAt: string;
}
```

### Post/Update Model (Summary)

```typescript
interface Update {
  _id: string;
  images: string[]; // URLs
  description: string;
  likes: string[]; // Like IDs
  dislikes: string[]; // Dislike IDs
  brandId: Brand;
  createdAt: string;
  updatedAt: string;
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[]; // For validation errors
}
```

### HTTP Status Codes

| Code | Meaning | When to Show |
|------|---------|--------------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, show validation errors |
| 401 | Unauthorized | Token missing/invalid - redirect to login |
| 403 | Forbidden | No permission - show error message |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (e.g., email exists) |
| 429 | Too Many Requests | Rate limited - show retry message |
| 500 | Server Error | Show generic error, retry button |

### Frontend Error Handling Pattern

```javascript
async function makeApiCall(endpoint, options = {}) {
  const token = localStorage.getItem('adminToken');
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    // Handle different status codes
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
      return null;
    }

    if (response.status === 403) {
      // Forbidden - show permission error
      alert('You do not have permission to perform this action.');
      return null;
    }

    if (response.status === 429) {
      // Rate limited
      alert(data.message || 'Too many requests. Please wait and try again.');
      return null;
    }

    if (!response.ok) {
      // Other errors
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    alert(error.message || 'Something went wrong. Please try again.');
    return null;
  }
}
```

---

## Security Considerations

### 1. Token Storage

**Recommended**: Use `localStorage` for simplicity or `httpOnly` cookies for maximum security.

```javascript
// Store token
localStorage.setItem('adminToken', token);

// Retrieve token
const token = localStorage.getItem('adminToken');

// Clear token on logout
localStorage.removeItem('adminToken');
```

### 2. Token Expiry Handling

```javascript
// Check token expiry before making requests
function isTokenExpired() {
  const token = localStorage.getItem('adminToken');
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Use in route guard or before API calls
if (isTokenExpired()) {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
}
```

### 3. Permission-Based UI

```javascript
// Hide/disable features based on permissions
const adminProfile = JSON.parse(localStorage.getItem('adminProfile'));

function canAccess(permission) {
  if (adminProfile.role === 'super_admin') return true;
  return adminProfile.permissions[permission] === true;
}

// Usage in React/Vue/Angular
{canAccess('canManageAdmins') && (
  <button onClick={createAdmin}>Create Admin</button>
)}
```

### 4. Role-Based Routing

```javascript
const routes = [
  {
    path: '/admin/dashboard',
    permission: 'canViewAnalytics',
  },
  {
    path: '/admin/users',
    permission: 'canManageUsers',
  },
  {
    path: '/admin/admins',
    role: 'super_admin', // Only super admin
  },
];

function canAccessRoute(route) {
  const admin = JSON.parse(localStorage.getItem('adminProfile'));
  
  if (route.role) {
    return admin.role === route.role;
  }
  
  if (route.permission) {
    if (admin.role === 'super_admin') return true;
    return admin.permissions[route.permission] === true;
  }
  
  return true;
}
```

### 5. HTTPS Only

**Production**: Always use HTTPS to prevent token interception.

```javascript
// Check protocol in production
if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
  window.location.href = `https:${window.location.href.substring(window.location.protocol.length)}`;
}
```

---

## Rate Limiting

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST `/login` | 5 requests | 15 minutes |
| All other endpoints | 30 requests | 1 minute |

### Response When Rate Limited

```json
{
  "success": false,
  "message": "Too many requests. Please slow down.",
  "retryAfter": "60 seconds"
}
```

### Frontend Handling

```javascript
async function handleRateLimit(response) {
  if (response.status === 429) {
    const data = await response.json();
    const retryAfter = data.retryAfter || '60 seconds';
    
    // Show user-friendly message
    showNotification(`Too many requests. Please try again after ${retryAfter}.`, 'warning');
    
    // Optionally disable submit button temporarily
    disableFormForDuration(retryAfter);
  }
}
```

---

## Frontend Integration Guide

### Recommended Tech Stack

- **Framework**: React, Vue.js, or Angular
- **UI Library**: Material-UI, Ant Design, or Tailwind CSS
- **Charts**: Chart.js, Recharts, or Apache ECharts
- **HTTP Client**: Axios or native Fetch API
- **State Management**: Redux, Vuex, or Context API
- **Routing**: React Router, Vue Router, or Angular Router

### Project Structure

```
admin-frontend/
├── src/
│   ├── api/
│   │   ├── auth.js          # Login, logout functions
│   │   ├── admins.js        # Admin CRUD operations
│   │   ├── stats.js         # Statistics endpoints
│   │   └── client.js        # Axios/fetch client with interceptors
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── Dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── ChartCard.jsx
│   │   │   └── RecentActivity.jsx
│   │   ├── Admins/
│   │   │   ├── AdminTable.jsx
│   │   │   ├── AdminForm.jsx
│   │   │   └── AdminModal.jsx
│   │   └── Auth/
│   │       ├── LoginForm.jsx
│   │       └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UserStats.jsx
│   │   ├── BrandStats.jsx
│   │   ├── PostStats.jsx
│   │   └── AdminManagement.jsx
│   ├── utils/
│   │   ├── auth.js          # Token management
│   │   ├── permissions.js   # Permission checking
│   │   └── formatters.js    # Date, number formatting
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useStats.js
│   │   └── useAdmins.js
│   └── App.jsx
```

### Complete API Client Example

```javascript
// api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminProfile');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

```javascript
// api/auth.js
import client from './client';

export const login = async (email, password) => {
  const response = await client.post('/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await client.post('/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await client.get('/profile');
  return response.data;
};
```

```javascript
// api/admins.js
import client from './client';

export const getAllAdmins = async () => {
  const response = await client.get('/admins');
  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await client.post('/admins', adminData);
  return response.data;
};

export const updateAdmin = async (id, updates) => {
  const response = await client.put(`/admins/${id}`, updates);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await client.delete(`/admins/${id}`);
  return response.data;
};
```

```javascript
// api/stats.js
import client from './client';

export const getDashboardStats = async () => {
  const response = await client.get('/stats/dashboard');
  return response.data;
};

export const getUserStats = async () => {
  const response = await client.get('/stats/users');
  return response.data;
};

export const getBrandStats = async () => {
  const response = await client.get('/stats/brands');
  return response.data;
};

export const getPostStats = async () => {
  const response = await client.get('/stats/posts');
  return response.data;
};
```

### React Hook Examples

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { getProfile } from '../api/auth';

export function useAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const data = await getProfile();
          setAdmin(data.data);
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const hasPermission = (permission) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions[permission] === true;
  };

  return { admin, loading, hasPermission };
}
```

```javascript
// hooks/useStats.js
import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/stats';

export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
```

### Component Examples

```jsx
// components/Dashboard/StatsCard.jsx
import React from 'react';

export function StatsCard({ title, value, icon, color }) {
  return (
    <div className={`stats-card bg-${color}-50 border-${color}-200`}>
      <div className="stats-icon">
        <i className={`icon-${icon}`}></i>
      </div>
      <div className="stats-content">
        <h3 className="stats-value">{value.toLocaleString()}</h3>
        <p className="stats-title">{title}</p>
      </div>
    </div>
  );
}
```

```jsx
// pages/Dashboard.jsx
import React from 'react';
import { useDashboardStats } from '../hooks/useStats';
import { StatsCard } from '../components/Dashboard/StatsCard';

export function Dashboard() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <StatsCard 
          title="Total Users" 
          value={stats.overview.totalUsers}
          icon="users"
          color="blue"
        />
        <StatsCard 
          title="Total Brands" 
          value={stats.overview.totalBrands}
          icon="building"
          color="green"
        />
        <StatsCard 
          title="Total Posts" 
          value={stats.overview.totalPosts}
          icon="file"
          color="purple"
        />
        <StatsCard 
          title="Verified Brands" 
          value={stats.overview.verifiedBrands}
          icon="check-circle"
          color="teal"
        />
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {/* Recent users and brands tables */}
      </div>
    </div>
  );
}
```

---

## UI/UX Recommendations

### Navigation Structure

```
Admin Panel
├── Dashboard (Landing page)
├── Analytics
│   ├── User Statistics
│   ├── Brand Statistics
│   └── Post Statistics
├── Management (if super admin)
│   └── Admin Accounts
└── Profile
    ├── View Profile
    └── Logout
```

### Color Scheme Suggestions

```css
:root {
  /* Primary colors */
  --primary: #3B82F6;      /* Blue */
  --success: #10B981;      /* Green */
  --warning: #F59E0B;      /* Orange */
  --danger: #EF4444;       /* Red */
  --info: #6366F1;         /* Indigo */
  
  /* Status colors */
  --verified: #10B981;
  --pending: #F59E0B;
  --inactive: #9CA3AF;
  
  /* Backgrounds */
  --bg-primary: #F9FAFB;
  --bg-card: #FFFFFF;
  --bg-hover: #F3F4F6;
}
```

### Page Layouts

**Dashboard**:
- Top: Welcome message + quick stats (4-6 cards)
- Middle: Charts (2-3 columns)
- Bottom: Recent activity tables

**Statistics Pages**:
- Top: Summary cards
- Middle: Main chart (full width)
- Bottom: Secondary charts + tables (2 columns)

**Admin Management**:
- Top: Search + Filter + "Create Admin" button
- Middle: Table with actions (Edit, Delete)
- Right: Slide-out panel for create/edit forms

### Responsive Breakpoints

```css
/* Mobile first approach */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ahid.com","password":"SuperAdmin@123!"}'

# Get dashboard stats (replace TOKEN)
curl -X GET http://localhost:5000/api/admin/stats/dashboard \
  -H "Authorization: Bearer TOKEN"

# Create admin
curl -X POST http://localhost:5000/api/admin/admins \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ahid.com","password":"Test@123!","firstName":"Test","lastName":"Admin","role":"admin"}'
```

### Using Postman

1. Create a collection: "Ahid Admin API"
2. Set collection variable: `baseUrl` = `http://localhost:5000/api/admin`
3. Create environment with `token` variable
4. In authorization tab, set type to "Bearer Token" with `{{token}}`

### Swagger/OpenAPI

Access interactive API documentation:
```
http://localhost:5000/api-docs
```
Look for the "Admin" section.

---

## Support & Resources

### Swagger Documentation
```
http://localhost:5000/api-docs
```

### Backend Repository
```
https://github.com/your-repo/ahid_app_backend
```

### Contact
For API questions or issues, contact the backend team.

---

## Changelog

### Version 1.0.0 (May 7, 2026)
- Initial admin API release
- Authentication endpoints
- Admin management (CRUD)
- Statistics and analytics endpoints
- Rate limiting implementation
- Security enhancements

---

**End of Documentation**

For additional features or custom endpoints, please contact the backend development team.
