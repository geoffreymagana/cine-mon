import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isColorLight(colorStr: string): boolean {
  if (!colorStr) return true;

  // Handles HSL, HSLA, RGB, RGBA color strings
  const matches = colorStr.match(/\(([^)]+)\)/);
  if (!matches) {
    // Basic fallback for named colors or hex (not perfect)
    if (colorStr.startsWith('#')) {
      const hex = colorStr.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    }
    return true; // Assume light for unknown formats
  }

  const parts = matches[1].split(',').map(s => s.trim().replace('%', ''));

  if (colorStr.includes('hsl')) {
    // HSL/HSLA: Check the lightness value (3rd parameter)
    const lightness = parseFloat(parts[2]);
    return lightness > 55; // Using 55% as a threshold for better contrast
  }

  if (colorStr.includes('rgb')) {
    // RGB/RGBA: Calculate luminance
    const r = parseInt(parts[0]);
    const g = parseInt(parts[1]);
    const b = parseInt(parts[2]);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  return true;
}
