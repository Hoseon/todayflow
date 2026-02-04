"use client";

import { useMemo } from "react";

import { isoDate, monthMatrix, parseIsoDate, sameDay } from "@/lib/date";
import { Task } from "@/lib/types";

type CalendarProps = {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  tasks: Task[];
};

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export function Calendar({ selectedDate, onSelectDate, tasks }: CalendarProps) {
  const selected = parseIsoDate(selectedDate);
  const dates = monthMatrix(selected);
  const cursorMonth = selected.getMonth();
  const today = new Date();

  const taskCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (task.completed) continue;
      map.set(task.dueDate, (map.get(task.dueDate) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  return (
    <section className="rounded-xl2 border border-ink/10 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">
          {selected.getFullYear()}년 {selected.getMonth() + 1}월
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink/60">달력에서 날짜 선택</span>
          <button
            onClick={() => onSelectDate(isoDate(new Date()))}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-medium text-ink/70 hover:bg-paper"
          >
            오늘로 이동
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekdays.map((day) => (
          <p key={day} className="pb-1.5 text-center text-xs font-medium text-ink/45">
            {day}
          </p>
        ))}

        {dates.map((date) => {
          const currentIso = isoDate(date);
          const count = taskCountByDate.get(currentIso) ?? 0;
          const isSelected = sameDay(date, selected);
          const inMonth = date.getMonth() === cursorMonth;
          const isToday = sameDay(date, today);
          const dayOfWeek = date.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <button
              key={currentIso}
              onClick={() => onSelectDate(currentIso)}
              className={`relative min-h-14 rounded-lg border p-2 text-left transition sm:min-h-16 ${
                isSelected
                  ? "border-accent/60 bg-[#fff4f0] text-ink shadow-sm"
                  : "border-ink/10 bg-[#f7f8fb] text-ink hover:border-ink/25"
              } ${!inMonth ? "opacity-45" : "opacity-100"}`}
            >
              <span
                className={`text-xs font-medium ${
                  isSelected
                    ? "text-[#a83c22]"
                    : isSunday
                      ? "text-[#bd3b3b]"
                      : isSaturday
                        ? "text-[#2e4ba8]"
                        : "text-ink/85"
                }`}
              >
                {date.getDate()}
              </span>

              {isToday && !isSelected && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent/70" aria-hidden />
              )}

              {count > 0 && (
                <span
                  className={`absolute bottom-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isSelected ? "bg-accent/20 text-[#a83c22]" : "bg-ink/10 text-ink/80"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
