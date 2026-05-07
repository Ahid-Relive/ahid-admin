import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminPermissions {
  canManageUsers: boolean;
  canManageBrands: boolean;
  canManageCategories: boolean;
  canManagePosts: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
}

interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  admin: AdminProfile | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  admin: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; admin: AdminProfile }>) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<AdminProfile>) => {
      state.admin = action.payload;
    },
  },
});

export const { setCredentials, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
