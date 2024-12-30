// src/lib/utils.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const calculateDailyGoal = (totalPages, daysLeft) => {
  if (daysLeft <= 0) return totalPages;
  return Math.ceil(totalPages / daysLeft);
}

export const calculateProgress = (currentPage, totalPages) => {
  return Math.min(Math.round((currentPage / totalPages) * 100), 100);
}

export const getDaysLeft = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}