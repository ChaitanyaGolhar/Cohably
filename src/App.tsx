import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AddExpensePage = lazy(() => import('./pages/AddExpensePage'));
const ExpenseHistoryPage = lazy(() => import('./pages/ExpenseHistoryPage'));
const ExpenseDetailPage = lazy(() => import('./pages/ExpenseDetailPage'));
const SettlePage = lazy(() => import('./pages/SettlePage'));
const RentCyclePage = lazy(() => import('./pages/RentCyclePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const ErrorPage = lazy(() => import('./components/ErrorPage'));

const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/onboarding',
            element: <OnboardingPage />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/expenses',
            element: <ExpenseHistoryPage />,
          },
          {
            path: '/expenses/add',
            element: <AddExpensePage />,
          },
          {
            path: '/expenses/:id',
            element: <ExpenseDetailPage />,
          },
          {
            path: '/settle',
            element: <SettlePage />,
          },
          {
            path: '/rent',
            element: <RentCyclePage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ]
  }
]);

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-semibold">Loading...</div>}>
      <RouterProvider router={router} />
      <ToastContainer />
    </Suspense>
  );
}
