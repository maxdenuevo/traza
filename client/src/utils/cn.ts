import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes with clsx
 * Handles conditional classes and properly merges Tailwind utilities
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
