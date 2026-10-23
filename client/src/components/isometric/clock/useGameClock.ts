import { useState, useEffect, useRef } from 'react';
import type { GameDate } from './gameClockTypes';

export interface UseGameClockReturn {
  date: GameDate;
  isPlaying: boolean;
  speed: number; // 1, 2, 5, 10
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setDate: (date: GameDate) => void;
}

export function useGameClock(
  initialYear: number = 1880,
  onDayTick?: (newDate: GameDate) => void
): UseGameClockReturn {
  const [date, setDate] = useState<GameDate>({
    day: 1,
    month: 1,
    year: initialYear,
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);

  const onTickRef = useRef(onDayTick);
  onTickRef.current = onDayTick;

  useEffect(() => {
    if (!isPlaying || speed === 0) return;

    // Bazowy interwał: przy 1x = 350ms na 1 dzień w grze (rok trwa ok. 2 minut)
    // Przy 2x = 175ms, przy 5x = 70ms, przy 10x = 35ms (bardzo szybki upływ roku)
    const baseIntervalMs = 350;
    const intervalMs = Math.max(30, Math.round(baseIntervalMs / speed));

    const timer = setInterval(() => {
      setDate((prev) => {
        let newDay = prev.day + 1;
        let newMonth = prev.month;
        let newYear = prev.year;

        // Uproszczony kalendarz 1880: 30 dni w każdym miesiącu (360 dni w roku)
        if (newDay > 30) {
          newDay = 1;
          newMonth += 1;
          if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
          }
        }

        const nextDate: GameDate = { day: newDay, month: newMonth, year: newYear };
        if (onTickRef.current) {
          onTickRef.current(nextDate);
        }
        return nextDate;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const togglePlay = () => setIsPlaying((p) => !p);

  return {
    date,
    isPlaying,
    speed,
    togglePlay,
    setSpeed,
    setDate,
  };
}
