import { useCalendar } from '../../hooks/useCalendar';
import { MONTHS_ES, DAYS_ES, isToday, isSameDay } from '../../utils/dateUtils';
import { Icon } from '../common/Icon';
import type { Visita } from '../../types';

interface CalendarProps {
  visitas?: Visita[];
  onDayClick?: (date: Date) => void;
  proximaVisita?: Date;
}

export const Calendar = ({ visitas = [], onDayClick, proximaVisita }: CalendarProps) => {
  const {
    year,
    month,
    calendarDays,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    getDateForDay,
  } = useCalendar();

  const getVisitasForDay = (day: number): Visita[] => {
    const date = getDateForDay(day);
    return visitas.filter(visita =>
      isSameDay(new Date(visita.fecha), date)
    );
  };

  const getDayClassName = (day: number | null): string => {
    if (!day) return 'invisible';

    const date = getDateForDay(day);
    const visitasOnDay = getVisitasForDay(day);
    const hasCompletedVisit = visitasOnDay.some(v => v.estado === 'completada');
    const isProxima = proximaVisita && isSameDay(date, proximaVisita);
    const today = isToday(date);

    let baseClass = 'calendar-day flex flex-col items-center justify-center text-sm p-3 rounded-lg cursor-pointer smooth-transition active-scale min-h-[44px]';

    if (today) {
      return `${baseClass} bg-esant-red text-esant-white font-bold shadow-md`;
    }
    if (isProxima) {
      return `${baseClass} bg-yellow-400 text-gray-900 font-semibold shadow-sm`;
    }
    if (hasCompletedVisit) {
      return `${baseClass} bg-esant-green text-esant-white font-medium shadow-sm`;
    }
    if (visitasOnDay.length > 0) {
      return `${baseClass} bg-esant-gray-200 text-esant-black font-medium border-2 border-esant-black`;
    }

    return `${baseClass} hover:bg-esant-gray-100 active:bg-esant-gray-200 text-esant-gray-800`;
  };

  return (
    <div className="bg-esant-white rounded-xl shadow-esant p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl text-esant-black">
          {MONTHS_ES[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="btn-touch p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
            aria-label="Mes anterior"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-esant-black hover:bg-esant-gray-100 rounded-lg btn-touch transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={goToNextMonth}
            className="btn-touch p-2 hover:bg-esant-gray-100 rounded-lg transition-colors"
            aria-label="Mes siguiente"
          >
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {DAYS_ES.map((day) => (
          <div key={day} className="text-center text-sm text-esant-gray-600 py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={getDayClassName(day)}
            onClick={() => day && onDayClick && onDayClick(getDateForDay(day))}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Legend - Diseño minimalista */}
      <div className="flex gap-6 mt-6 text-sm border-t border-esant-gray-200 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-esant-green rounded-sm"></div>
          <span className="text-esant-gray-600">Realizada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-esant-red rounded-sm"></div>
          <span className="text-esant-gray-600">Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
          <span className="text-esant-gray-600">Próxima</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-esant-black rounded-sm"></div>
          <span className="text-esant-gray-600">Programada</span>
        </div>
      </div>
    </div>
  );
};
