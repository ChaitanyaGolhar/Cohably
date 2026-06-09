import { useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 -mt-8 -ml-8 h-32 w-32 rounded-full bg-indigo-50 mix-blend-multiply opacity-50"></div>
        <div className="absolute bottom-0 right-0 -mb-8 -mr-8 h-32 w-32 rounded-full bg-teal-50 mix-blend-multiply opacity-50"></div>

        <div className="relative z-10">
          <div className="mx-auto h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <Search className="h-10 w-10 relative z-10" />
            <div className="absolute inset-0 border-4 border-white rounded-full"></div>
            <div className="absolute -inset-1 border-2 border-indigo-100 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
          </div>
          
          <h1 className="text-6xl font-extrabold text-indigo-600 tracking-tight mb-2 opacity-20">404</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lost in the void</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-[250px] mx-auto">
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </p>

          <div className="grid gap-3">
            <Button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 w-full">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)} className="flex items-center justify-center gap-2 w-full">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
