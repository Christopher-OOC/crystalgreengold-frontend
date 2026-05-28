'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { useAuth } from '@/features/auth/AuthContext';
import { getDashboardTabFromPath, getDashboardTabPath, type DashboardTab } from '@/features/navigation/paths';
import { useTopnivoTheme } from '@/features/navigation/useTopnivoTheme';

export function DashboardRoute({ tab }: { tab: DashboardTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { isDark, setIsDark } = useTopnivoTheme();
  const routeTab = getDashboardTabFromPath(pathname) ?? tab;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <Dashboard
      initialTab={routeTab}
      onTabChange={(nextTab) => {
        const nextPath = getDashboardTabPath(nextTab);
        if (window.location.pathname !== nextPath) {
          router.push(nextPath, { scroll: false });
        }
      }}
      onLogout={() => {
        logout();
        router.push('/');
      }}
      isDark={isDark}
      setIsDark={setIsDark}
    />
  );
}
