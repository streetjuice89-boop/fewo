import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Calendar, Users, MessageSquare, 
  Link2, FileText, LogOut, Menu, X 
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/auth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Unterkünfte', href: '/properties', icon: Building2 },
  { name: 'Buchungen', href: '/bookings', icon: Calendar },
  { name: 'Kunden', href: '/customers', icon: Users },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Airbnb', href: '/airbnb', icon: Link2 },
  { name: 'Logs', href: '/logs', icon: FileText },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-deep flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-navy-medium border-r border-navy-light
        transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-navy-light">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="VoyageNest" className="h-10 w-auto rounded-xl" />
              <div>
                <h1 className="font-display font-semibold text-pearl">VoyageNest</h1>
                <p className="text-xs text-warm-gray">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                end={item.href === '/'}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-navy-light">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center">
                <Users className="w-5 h-5 text-warm-gray" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-pearl truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-warm-gray truncate">@{user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              Abmelden
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-navy-medium border-b border-navy-light flex items-center px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-pearl mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

