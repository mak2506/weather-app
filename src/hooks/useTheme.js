import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'theme';

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) return savedTheme;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, isDarkMode: theme === 'dark', toggleTheme };
} 