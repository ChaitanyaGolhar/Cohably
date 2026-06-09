import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { useToast } from './useToast';

export function useAuth() {
  const { login: storeLogin, logout: storeLogout, setUser, token, user } = useAuthStore();
  const addToast = useToast((s) => s.addToast);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      return data.data; // { user, token }
    },
    onSuccess: (data) => {
      storeLogin(data.token, data.user);
      addToast({ type: 'success', title: 'Welcome back!' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        title: 'Login failed', 
        message: error.response?.data?.error?.message || 'Check your credentials and try again.' 
      });
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/signup', credentials);
      return data.data; // { user, token }
    },
    onSuccess: (data) => {
      storeLogin(data.token, data.user);
      addToast({ type: 'success', title: 'Account created!' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        title: 'Signup failed', 
        message: error.response?.data?.error?.message || 'An error occurred during signup.' 
      });
    }
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      if (!token) return null;
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      return data.data;
    },
    enabled: !!token, // only run if we have a token
    retry: false,
  });

  return {
    user,
    token,
    profile,
    isProfileLoading,
    isAuthenticated: !!token,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    logout: storeLogout,
  };
}
