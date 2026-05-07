'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  UserCog,
  BarChart3,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  isSuperAdminOnly?: boolean;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'canViewAnalytics',
    children: [
      {
        name: 'User Statistics',
        href: '/analytics/users',
        icon: Users,
        permission: 'canViewAnalytics',
      },
      {
        name: 'Brand Statistics',
        href: '/analytics/brands',
        icon: Building2,
        permission: 'canViewAnalytics',
      },
      {
        name: 'Post Statistics',
        href: '/analytics/posts',
        icon: FileText,
        permission: 'canViewAnalytics',
      },
    ],
  },
  {
    name: 'Admin Management',
    href: '/admins',
    icon: UserCog,
    isSuperAdminOnly: true,
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { admin, logout, hasPermission, isSuperAdmin } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Analytics']);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const canAccessItem = (item: NavItem): boolean => {
    if (item.isSuperAdminOnly) return isSuperAdmin();
    if (item.permission) return hasPermission(item.permission as any);
    return true;
  };

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) || false;
  };

  return (
    <div
      className={`flex flex-col h-full dark:bg-[var(--sidebar-bg)] bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] w-64 transition-all duration-300 fixed lg:static inset-y-0 left-0 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <div className="relative w-full h-full">
            <Image
              src="/ahid_logo.png"
              alt="Ahid Logo"
              width={360}
              height={240}
              className="w-[40px] h-full object-cover"
              priority
            />
          </div>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            if (!canAccessItem(item)) return null;

            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const active = isActive(item.href);

            return (
              <li key={item.name}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        active
                          ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-4.5 h-4.5" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <ul className="mt-0.5 ml-3 pl-3 border-l border-[var(--border-light)] space-y-0.5">
                        {item.children?.map((child) => {
                          if (!canAccessItem(child)) return null;
                          const childActive = isActive(child.href);

                          return (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                  childActive
                                    ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                }`}
                              >
                                <child.icon className="w-4 h-4"/>
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      active
                        ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-[var(--border-color)] p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 p-2 rounded-lg bg-[var(--bg-hover)]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] truncate">
              {admin?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--danger)' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
