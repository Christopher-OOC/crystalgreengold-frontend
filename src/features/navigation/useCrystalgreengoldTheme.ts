'use client';

import { useEffect, useState } from 'react';

export function useCrystalgreengoldTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('crystalgreengold-theme');
    if (saved) {
      setIsDark(saved === 'dark');
      return;
    }

    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('crystalgreengold-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, setIsDark };
}

