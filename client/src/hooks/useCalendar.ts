import { useState, useMemo } from 'react';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';

export const useCalendar = (initialDate: Date = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateForDay = (day: number): Date => {
    return new Date(year, month, day);
  };

  return {
    currentDate,
    year,
    month,
    calendarDays,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getDateForDay,
  };
};
