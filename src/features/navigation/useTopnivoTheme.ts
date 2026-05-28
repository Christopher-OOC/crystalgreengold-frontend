'use client';

import { useEffect, useState } from 'react';

export function useTopnivoTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('topnivo-theme');
    if (saved) {
      setIsDark(saved === 'dark');
      return;
    }

    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('topnivo-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, setIsDark };
}
