import React, { useState, useEffect } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      const isDarkMode = JSON.parse(savedMode);
      setIsDark(isDarkMode);
      applyDarkMode(isDarkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      applyDarkMode(prefersDark);
    }
  }, []);

  const applyDarkMode = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggle = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    applyDarkMode(newMode);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
