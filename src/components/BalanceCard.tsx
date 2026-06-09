import { Card } from './ui/Card';
import { AmountDisplay } from './ui/AmountDisplay';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import type { MyBalances } from '../types/api';

interface BalanceCardProps {
  balances?: MyBalances;
  isLoading?: boolean;
}

export function BalanceCard({ balances, isLoading }: BalanceCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse bg-white border-none shadow-md">
        <div className="h-24 bg-gray-100 rounded-lg"></div>
      </Card>
    );
  }

  if (!balances) return null;

  const netTotal = balances.netTotal;
  const isOwed = netTotal > 0;
  const isOwe = netTotal < 0;
  const isSettled = netTotal === 0;

  return (
    <Card className={`relative overflow-hidden border-none text-white shadow-lg ${
      isOwed ? 'bg-emerald-600' : isOwe ? 'bg-red-500' : 'bg-indigo-600'
    }`}>
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10 mix-blend-overlay"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-black opacity-10 mix-blend-overlay"></div>

      <div className="relative z-10 flex flex-col items-center text-center p-2">
        <span className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">
          {isOwed ? 'Owed to you' : isOwe ? 'You owe' : 'All Settled Up'}
        </span>
        
        <div className="flex items-center gap-2">
          {isOwed && <ArrowDownRight className="h-6 w-6 opacity-80" />}
          {isOwe && <ArrowUpRight className="h-6 w-6 opacity-80" />}
          {isSettled && <Activity className="h-6 w-6 opacity-80" />}
          <AmountDisplay 
            amount={Math.abs(netTotal)} 
            size="xl" 
            className="text-white font-extrabold" 
          />
        </div>
      </div>
    </Card>
  );
}
