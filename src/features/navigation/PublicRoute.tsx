'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomePage, type ActiveView } from '@/features/landing/HomePage';
import { useAuth } from '@/features/auth/AuthContext';
import { getPublicViewPath } from '@/features/navigation/paths';
import { useCrystalgreengoldTheme } from '@/features/navigation/useCrystalgreengoldTheme';

export function PublicRoute({ view }: { view: ActiveView }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isDark, setIsDark } = useCrystalgreengoldTheme();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <HomePage
      initialView={view}
      onViewChange={(nextView) => router.push(getPublicViewPath(nextView))}
      onSignIn={() => router.push('/login')}
      onSignUp={() => router.push('/signup')}
      isDark={isDark}
      setIsDark={setIsDark}
    />
  );
}

