import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Calendar, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Rent', href: '/rent', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe sm:hidden z-40">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = path.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-indigo-100")} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
