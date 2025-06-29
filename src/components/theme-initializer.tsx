'use client';

import * as React from 'react';

// This script will run on the client and apply the theme from localStorage.
// It's placed in a component to ensure it runs on every page load.
export function ThemeInitializer() {
  React.useEffect(() => {
    const storedTheme = localStorage.getItem('cinemon-theme') || 'purple';
    const storedDarkMode = localStorage.getItem('cinemon-dark-mode') !== 'false';

    const docEl = document.documentElement;

    // Apply dark mode
    docEl.classList.toggle('dark', storedDarkMode);

    // Remove any existing theme classes
    docEl.classList.forEach(cls => {
      if (cls.startsWith('theme-')) {
        docEl.classList.remove(cls);
      }
    });

    // Add the current theme class
    if (storedTheme !== 'purple') {
      docEl.classList.add(`theme-${storedTheme}`);
    }
  }, []);

  return null;
}
