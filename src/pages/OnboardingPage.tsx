import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFlatMutations } from '../hooks/useFlatMutations';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const createSchema = z.object({
  name: z.string().min(3, 'Flat name must be at least 3 characters'),
});

const joinSchema = z.object({
  inviteCode: z.string().length(6, 'Invite code must be exactly 6 characters').toUpperCase(),
});

type CreateForm = z.infer<typeof createSchema>;
type JoinForm = z.infer<typeof joinSchema>;

export default function OnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { createFlat, isCreating, joinFlat, isJoining } = useFlatMutations();

  // If user already has a flat, redirect to dashboard
  useEffect(() => {
    if (user?.membership?.isActive) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const joinForm = useForm<JoinForm>({ resolver: zodResolver(joinSchema) });

  const onCreate = async (data: CreateForm) => {
    try {
      await createFlat(data);
      navigate('/dashboard', { replace: true });
    } catch (e) {}
  };

  const onJoin = async (data: JoinForm) => {
    try {
      await joinFlat(data);
      navigate('/dashboard', { replace: true });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Let's get your household set up
          </p>
        </div>

        {mode === 'choose' && (
          <div className="grid gap-4 mt-8">
            <Card 
              className="cursor-pointer hover:border-indigo-600 hover:ring-1 hover:ring-indigo-600 transition-all p-6 group"
              onClick={() => setMode('create')}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create a new Flat</h3>
                  <p className="text-sm text-gray-500 mt-1">Start a new household and invite roommates</p>
                </div>
              </div>
            </Card>

            <Card 
              className="cursor-pointer hover:border-emerald-600 hover:ring-1 hover:ring-emerald-600 transition-all p-6 group"
              onClick={() => setMode('join')}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Join existing Flat</h3>
                  <p className="text-sm text-gray-500 mt-1">Enter an invite code from your roommate</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {mode === 'create' && (
          <Card className="p-6">
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Name your flat</h3>
                <p className="text-sm text-gray-500 mt-1">Give your household a recognizable name.</p>
              </div>
              <Input
                label="Flat Name"
                placeholder="e.g. Sunset Apartments 4B"
                error={createForm.formState.errors.name?.message}
                {...createForm.register('name')}
              />
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setMode('choose')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" isLoading={isCreating}>
                  Create
                </Button>
              </div>
            </form>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="p-6">
            <form onSubmit={joinForm.handleSubmit(onJoin)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Enter Invite Code</h3>
                <p className="text-sm text-gray-500 mt-1">Ask your roommate for the 6-character code.</p>
              </div>
              <Input
                label="Invite Code"
                placeholder="ABCDEF"
                className="uppercase"
                maxLength={6}
                error={joinForm.formState.errors.inviteCode?.message}
                {...joinForm.register('inviteCode')}
              />
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setMode('choose')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500" isLoading={isJoining}>
                  Join
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
