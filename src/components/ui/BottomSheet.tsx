import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div className={cn("fixed inset-0 z-50 sm:hidden transition-opacity", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed inset-x-0 bottom-0 z-50 transform rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full",
        className
      )}>
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between px-6 pb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors bg-gray-50 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
