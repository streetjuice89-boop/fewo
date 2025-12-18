'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  Users,
  Globe,
  Tags,
  MessageSquare,
  Download,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@voyagenest/ui';

const menuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: Home, label: 'Unterkünfte' },
  { href: '/bookings', icon: CalendarCheck, label: 'Buchungen' },
  { href: '/customers', icon: Users, label: 'Kunden' },
  { href: '/countries', icon: Globe, label: 'Länder' },
  { href: '/categories', icon: Tags, label: 'Kategorien' },
  { href: '/chat', icon: MessageSquare, label: 'Live-Chat' },
  { href: '/airbnb', icon: Download, label: 'Airbnb Import' },
  { href: '/logs', icon: FileText, label: 'System-Logs' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-navy-medium border-r border-navy-light flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-navy-light">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-sunset flex items-center justify-center">
            <span className="text-navy-deep font-bold text-lg">V</span>
          </div>
          <div>
            <span className="font-display text-lg font-semibold text-pearl">VoyageNest</span>
            <p className="text-xs text-warm-gray">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-ui text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-light">
        <Link href="/settings" className="sidebar-link">
          <Settings className="h-5 w-5" />
          <span className="font-ui text-sm">Einstellungen</span>
        </Link>
      </div>
    </aside>
  );
}

