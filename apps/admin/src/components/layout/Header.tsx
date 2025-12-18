'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, User } from 'lucide-react';
import { Button, Avatar } from '@voyagenest/ui';
import { useAuthStore } from '@/store/auth';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-navy-medium/80 backdrop-blur-md border-b border-navy-light z-40">
      <div className="flex items-center justify-between h-full px-8">
        {/* Left */}
        <div></div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-navy-light transition-colors relative">
            <Bell className="h-5 w-5 text-warm-gray" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-sunset rounded-full" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-navy-light">
            <Avatar name={user ? `${user.firstName} ${user.lastName}` : ''} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-pearl">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-warm-gray">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

