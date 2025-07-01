'use client';

import * as React from 'react';
import { MovieService } from '@/lib/movie-service';

// This script will run on the client and apply the theme from IndexedDB.
// It's placed in a component to ensure it runs on every page load.
export function ThemeInitializer() {
  React.useEffect(() => {
    const applyTheme = async () => {
      try {
        const [storedTheme, storedDarkMode] = await Promise.all([
          MovieService.getSetting('cinemon-theme'),
          MovieService.getSetting('cinemon-dark-mode'),
        ]);

        const currentTheme = storedTheme || 'purple';
        // Defaults to dark mode if setting is not present (null/undefined) or not 'false'
        const currentDarkMode = storedDarkMode !== 'false';

        const docEl = document.documentElement;

        // Apply dark mode
        docEl.classList.toggle('dark', currentDarkMode);

        // Remove any existing theme classes
        docEl.classList.forEach(cls => {
          if (cls.startsWith('theme-')) {
            docEl.classList.remove(cls);
          }
        });

        // Add the current theme class
        if (currentTheme !== 'purple') {
          docEl.classList.add(`theme-${currentTheme}`);
        }
      } catch (error) {
        console.error("Failed to initialize theme from IndexedDB:", error);
        // Fallback to default dark theme if DB access fails
        document.documentElement.classList.add('dark');
      }
    };
    
    applyTheme();
  }, []);

  return null;
}
