import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Calendar, Settings, ArrowLeftRight, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-indigo-600', fill: 'fill-indigo-100' },
    { name: 'Expenses', href: '/expenses', icon: Receipt, color: 'text-indigo-600', fill: 'fill-indigo-100' },
    { name: 'Rent', href: '/rent', icon: Calendar, color: 'text-indigo-600', fill: 'fill-indigo-100' },
    { name: 'Settle', href: '/settle', icon: ArrowLeftRight, color: 'text-indigo-600', fill: 'fill-indigo-100' },
    { name: 'Flat', href: '/flat', icon: Building2, color: 'text-violet-600', fill: 'fill-violet-100' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'text-indigo-600', fill: 'fill-indigo-100' },
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
                isActive ? tab.color : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isActive && tab.fill)} />
              <span className="hidden sm:inline text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
