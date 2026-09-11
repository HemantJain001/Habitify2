"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  BookOpen,
  Target,
  Brain,
  Dumbbell,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalEntry, PowerSystemTodo } from "@/lib/api";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJournal?: (date: Date) => void;
  journalEntries?: JournalEntry[];
  powerSystemTodos?: PowerSystemTodo[];
}

function toDateKey(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().split("T")[0];
}

export function CalendarModal({
  isOpen,
  onClose,
  onOpenJournal,
  journalEntries = [],
  powerSystemTodos = [],
}: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const currentMonth = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Mock events data
  const events = {
    15: [
      { id: 1, title: "Team Meeting", time: "10:00 AM", type: "work" },
      { id: 2, title: "Gym Session", time: "6:00 PM", type: "fitness" },
    ],
    20: [
      { id: 3, title: "Project Deadline", time: "5:00 PM", type: "important" },
    ],
    25: [
      { id: 4, title: "Code Review", time: "2:00 PM", type: "work" },
      { id: 5, title: "Study Session", time: "8:00 PM", type: "personal" },
    ],
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasJournalEntry = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const key = toDateKey(date);
    return journalEntries.some((entry) => toDateKey(entry.date) === key);
  };

  const hasEvents = (day: number) => {
    return events[day as keyof typeof events]?.length > 0;
  };

  const getPowerSystemProgress = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const key = toDateKey(date);
    const dayTodos = powerSystemTodos.filter(
      (todo) => toDateKey(todo.date) === key,
    );
    const completed = dayTodos.filter((todo) => todo.completed).length;
    return { completed, total: dayTodos.length };
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(clickedDate);
  };

  const handleOpenJournal = (date?: Date) => {
    const targetDate = date || selectedDate || new Date();
    onOpenJournal?.(targetDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[oklch(0.2_0.02_255/0.5)] z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <h2 className="font-display text-xl font-semibold text-[var(--fg)]">
              Calendar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-muted)] rounded-md transition-colors "
          >
            <X className="w-5 h-5 text-[var(--fg-subtle)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--fg)]">
                  {currentMonth}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-[var(--bg-muted)] rounded-md transition-colors "
                  >
                    <ChevronLeft className="w-4 h-4 text-[var(--fg-subtle)]" />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-[var(--bg-muted)] rounded-md transition-colors "
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--fg-subtle)]" />
                  </button>
                </div>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-sm font-medium text-[var(--fg-subtle)] text-center py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="h-12"></div>;
                  }

                  const progress = getPowerSystemProgress(day);
                  const hasJournal = hasJournalEntry(day);
                  const hasEventsToday = hasEvents(day);
                  const selectedDay = selectedDate?.getDate();
                  const isSelectedMonth =
                    selectedDate?.getMonth() === currentDate.getMonth() &&
                    selectedDate?.getFullYear() === currentDate.getFullYear();

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "h-12 text-sm rounded-md transition-colors relative flex flex-col items-center justify-center",
                        isToday(day)
                          ? "bg-blue-500 text-white font-semibold"
                          : selectedDay === day && isSelectedMonth
                            ? "bg-[var(--accent-soft)]/30 text-[var(--fg-muted)]"
                            : "hover:bg-[var(--bg-muted)] text-[var(--fg-muted)]",
                        (hasJournal || hasEventsToday) &&
                          !isToday(day) &&
                          "font-semibold",
                      )}
                    >
                      <span className="text-xs">{day}</span>

                      {/* Indicators */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {hasJournal && (
                          <div className="w-1 h-1 bg-[var(--success)] rounded-full"></div>
                        )}
                        {hasEventsToday && (
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        )}
                        {progress.total > 0 &&
                          progress.completed === progress.total && (
                            <div className="w-1 h-1 bg-[var(--accent)] rounded-full"></div>
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Add Event Button */}
              <button
                onClick={() => handleOpenJournal()}
                className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-3 rounded-md font-medium transition-colors "
              >
                <BookOpen className="w-4 h-4" />
                Open Journal
              </button>

              {/* Selected Date Info */}
              {selectedDate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[var(--fg)]">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year:
                          selectedDate.getFullYear() !==
                          new Date().getFullYear()
                            ? "numeric"
                            : undefined,
                      })}
                    </h4>
                    <button
                      onClick={() => handleOpenJournal(selectedDate)}
                      className="text-[var(--accent)] hover:text-[var(--accent)] dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Journal
                    </button>
                  </div>

                  {/* Events for Selected Date */}
                  {(() => {
                    const selectedDay = selectedDate.getDate();
                    const dayEvents =
                      events[selectedDay as keyof typeof events];

                    return dayEvents ? (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-[var(--fg-muted)]">
                          Events
                        </h5>
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "p-3 rounded-md border-l-4",
                                event.type === "work" &&
                                  "bg-[var(--accent-soft)] border-blue-500",
                                event.type === "fitness" &&
                                  "bg-[var(--success)]/8 border-green-500",
                                event.type === "important" &&
                                  "bg-[var(--danger)]/8 border-red-500",
                                event.type === "personal" &&
                                  "bg-[var(--accent-soft)] border-purple-500",
                              )}
                            >
                              <div className="font-medium text-[var(--fg)] text-sm">
                                {event.title}
                              </div>
                              <div className="text-xs text-[var(--fg-subtle)]">
                                {event.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--fg-subtle)] text-center py-4">
                        No events for this day
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Upcoming Events */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[var(--fg)]">Upcoming</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-[var(--bg-muted)] rounded-md">
                    <div className="font-medium text-[var(--fg)] text-sm">
                      Team Standup
                    </div>
                    <div className="text-xs text-[var(--fg-subtle)]">
                      Tomorrow at 9:00 AM
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--bg-muted)] rounded-md">
                    <div className="font-medium text-[var(--fg)] text-sm">
                      Workout Session
                    </div>
                    <div className="text-xs text-[var(--fg-subtle)]">
                      Dec 27 at 6:00 PM
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[var(--fg)]">This Month</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-[var(--bg-muted)] rounded-md">
                    <div className="font-semibold text-[var(--fg)]">12</div>
                    <div className="text-xs text-[var(--fg-subtle)]">
                      Events
                    </div>
                  </div>
                  <div className="text-center p-2 bg-[var(--bg-muted)] rounded-md">
                    <div className="font-semibold text-[var(--fg)]">8</div>
                    <div className="text-xs text-[var(--fg-subtle)]">
                      Completed
                    </div>
                  </div>
                </div>
              </div>

              {/* Power System Progress */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[var(--fg)]">Power System</h4>
                <div className="space-y-2">
                  {(["brain", "muscle", "money"] as const).map((identity) => {
                    const config = {
                      brain: {
                        Icon: Brain,
                        color: "text-sky-600",
                        bg: "bg-sky-50 dark:bg-sky-950/30",
                        bar: "bg-sky-500",
                      },
                      muscle: {
                        Icon: Dumbbell,
                        color: "text-[var(--success)]",
                        bg: "bg-[var(--success)]/10",
                        bar: "bg-[var(--success)]",
                      },
                      money: {
                        Icon: Coins,
                        color: "text-[var(--accent)]",
                        bg: "bg-[var(--accent-soft)]",
                        bar: "bg-[var(--accent)]",
                      },
                    }[identity];

                    const todayKey = toDateKey(new Date());
                    const todayTodos = powerSystemTodos.filter(
                      (todo) =>
                        todo.category === identity &&
                        toDateKey(todo.date) === todayKey,
                    );
                    const completed = todayTodos.filter(
                      (todo) => todo.completed,
                    ).length;
                    const total = todayTodos.length;
                    const percentage =
                      total > 0 ? (completed / total) * 100 : 0;

                    return (
                      <div
                        key={identity}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg",
                          config.bg,
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <config.Icon
                            className={cn("w-3.5 h-3.5", config.color)}
                          />
                          <span className="text-xs font-medium text-[var(--fg-muted)] capitalize">
                            {identity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                config.bar,
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span
                            className={cn("text-xs font-bold", config.color)}
                          >
                            {completed}/{total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Progress */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[var(--fg)]">Daily Tasks</h4>
                <div className="space-y-2">
                  {(() => {
                    // Mock daily tasks - in real app this would come from props
                    const mockDailyTasks = [
                      {
                        id: "1",
                        title: "Complete morning routine",
                        completed: true,
                        category: "personal",
                      },
                      {
                        id: "2",
                        title: "Review project documentation",
                        completed: true,
                        category: "work",
                      },
                      {
                        id: "3",
                        title: "Gym workout",
                        completed: false,
                        category: "fitness",
                      },
                      {
                        id: "4",
                        title: "Read for 30 minutes",
                        completed: false,
                        category: "learning",
                      },
                    ];

                    const completedCount = mockDailyTasks.filter(
                      (task) => task.completed,
                    ).length;
                    const totalCount = mockDailyTasks.length;
                    const completionPercentage =
                      totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                    return (
                      <>
                        <div className="flex justify-between items-center p-2 bg-[var(--bg-muted)] rounded-lg">
                          <span className="text-xs font-medium text-[var(--fg-muted)]">
                            Today's Progress
                          </span>
                          <span className="text-xs font-bold text-[var(--accent)]">
                            {completedCount}/{totalCount}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
