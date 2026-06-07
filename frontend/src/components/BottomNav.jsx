import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, MapPin, BookOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'CUSTOMER') return null;

  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const navItems = [
    { name: 'Play', path: '/play', icon: Play },
    { name: 'Book', path: '/', icon: MapPin },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe pt-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] sm:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? 'scale-110 transition-transform' : ''} />
              <span className={`text-[10px] font-bold tracking-wide ${active ? 'opacity-100' : 'opacity-80'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
