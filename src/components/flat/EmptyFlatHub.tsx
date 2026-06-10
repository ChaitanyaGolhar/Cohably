import { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface EmptyFlatHubProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaText?: string;
  onCta?: () => void;
}

export function EmptyFlatHub({ icon, title, description, ctaText, onCta }: EmptyFlatHubProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-100 border-dashed py-12">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-[250px]">
        {description}
      </p>
      {ctaText && onCta && (
        <Button onClick={onCta} size="sm">
          {ctaText}
        </Button>
      )}
    </div>
  );
}
