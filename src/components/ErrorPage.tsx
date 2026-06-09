import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page you're looking for doesn't exist.";
    } else if (error.status === 401) {
      title = "Unauthorized";
      message = "You don't have permission to access this page.";
    } else {
      title = `${error.status} Error`;
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-red-50 mix-blend-multiply opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-orange-50 mix-blend-multiply opacity-50"></div>

        <div className="relative z-10">
          <div className="mx-auto h-16 w-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-500 mb-8 max-w-[250px] mx-auto">
            {message}
          </p>

          <div className="grid gap-3">
            <Button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 w-full">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 w-full text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
