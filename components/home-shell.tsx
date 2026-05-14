'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { CircularClock } from '@/components/circular-clock';
import { Timeline } from '@/components/timeline';
import { ActivityForm } from '@/components/activity-form';
import { Button } from '@/components/ui/button';
import type { Activity, ActivityHistoryEntry } from '@/types/activity';

const ACTIVITIES_STORAGE_KEY = 'clock-saas-activities';
const HISTORY_STORAGE_KEY = 'clock-saas-history';
const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: '1',
    name: 'Napping',
    color: '#FF6347',
    startHour: 13,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    ringTimes: 1,
  },
  {
    id: '2',
    name: 'Working',
    color: '#1E90FF',
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    ringTimes: 1,
  },
  {
    id: '3',
    name: 'Exercise',
    color: '#32CD32',
    startHour: 18,
    startMinute: 0,
    endHour: 19,
    endMinute: 0,
    ringTimes: 1,
  },
];

export type PageId = 'dashboard' | 'history' | 'settings';

interface HomeShellProps {
  currentPage: PageId;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMinuteStart(date: Date, hour = date.getHours(), minute = date.getMinutes()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
}

function normalizeHour(hour: number) {
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

function normalizeMinute(minute: number) {
  return Math.min(59, Math.max(0, Math.floor(minute)));
}

function normalizeRingTimes(ringTimes: number) {
  return Math.min(6, Math.max(1, Math.floor(ringTimes)));
}

function normalizeActivity(activity: Activity): Activity {
  return {
    ...activity,
    startHour: normalizeHour(activity.startHour),
    startMinute: normalizeMinute(activity.startMinute ?? 0),
    endHour: normalizeHour(activity.endHour),
    endMinute: normalizeMinute(activity.endMinute ?? 0),
    ringTimes: normalizeRingTimes(activity.ringTimes ?? 1),
  };
}

export function HomeShell({ currentPage }: HomeShellProps) {
  const [activities, setActivities] = useState<Activity[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ACTIVITIES;

    const savedActivities = window.localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (!savedActivities) return DEFAULT_ACTIVITIES;

    try {
      return (JSON.parse(savedActivities) as Activity[]).map(normalizeActivity);
    } catch {
      return DEFAULT_ACTIVITIES;
    }
  });
  const [currentTime, setCurrentTime] = useState<Date | null>(() =>
    typeof window === 'undefined' ? null : new Date()
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>();
  const [history, setHistory] = useState<ActivityHistoryEntry[]>(() => {
    if (typeof window === 'undefined') return [];

    const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!savedHistory) return [];

    try {
      return JSON.parse(savedHistory) as ActivityHistoryEntry[];
    } catch {
      return [];
    }
  });
  const historyIdsRef = React.useRef<Set<string>>(new Set());
  const lastCheckedAtRef = React.useRef<Date | null>(null);

  const playRingSound = (repeatCount = 1) => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const notes = [880, 988, 880, 988];
    const noteDuration = 0.14;
    const gap = 0.06;
    const ringGap = 0.18;
    const ringDuration = notes.length * (noteDuration + gap);
    const totalRings = Math.max(1, Math.min(repeatCount, 12));
    const startAt = audioCtx.currentTime + 0.02;

    for (let ringIndex = 0; ringIndex < totalRings; ringIndex += 1) {
      const ringOffset = ringIndex * (ringDuration + ringGap);

      notes.forEach((frequency, noteIndex) => {
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const noteStart = startAt + ringOffset + noteIndex * (noteDuration + gap);
        const noteEnd = noteStart + noteDuration;

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.13, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd + 0.01);
      });
    }

    const totalDuration = totalRings * ringDuration + (totalRings - 1) * ringGap + 0.12;
    window.setTimeout(() => {
      void audioCtx.close();
    }, totalDuration * 1000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    historyIdsRef.current = new Set(history.map((entry) => entry.id));
  }, [history]);

  useEffect(() => {
    if (!currentTime) return;

    const now = currentTime;
    const lastCheckedAt = lastCheckedAtRef.current;
    const minutesToCheck: Date[] = [];

    if (!lastCheckedAt || getLocalDateKey(lastCheckedAt) !== getLocalDateKey(now)) {
      for (let hour = 0; hour <= now.getHours(); hour += 1) {
        const maxMinute = hour === now.getHours() ? now.getMinutes() : 59;
        for (let minute = 0; minute <= maxMinute; minute += 1) {
          minutesToCheck.push(getMinuteStart(now, hour, minute));
        }
      }
    } else {
      const cursor = getMinuteStart(lastCheckedAt);
      cursor.setMinutes(cursor.getMinutes() + 1);
      const currentMinuteStart = getMinuteStart(now);

      while (cursor <= currentMinuteStart) {
        minutesToCheck.push(new Date(cursor));
        cursor.setMinutes(cursor.getMinutes() + 1);
      }
    }

    const pendingEntries: ActivityHistoryEntry[] = [];
    let ringCount = 0;

    minutesToCheck.forEach((minuteStart) => {
      const hour = minuteStart.getHours();
      const minute = minuteStart.getMinutes();

      activities.forEach((activity) => {
        if (activity.startHour !== hour || activity.startMinute !== minute) return;

        const entryId = `${activity.id}-${minuteStart.toISOString()}`;
        if (historyIdsRef.current.has(entryId)) return;

        historyIdsRef.current.add(entryId);
        pendingEntries.push({
          id: entryId,
          activityId: activity.id,
          activityName: activity.name,
          triggeredAt: minuteStart.toISOString(),
        });

        const ageMs = now.getTime() - minuteStart.getTime();
        if (ageMs >= 0 && ageMs <= 65000) {
          ringCount += normalizeRingTimes(activity.ringTimes ?? 1);
        }
      });
    });

    if (pendingEntries.length > 0) {
      playRingSound(ringCount);
      setHistory((prev) => [...pendingEntries.reverse(), ...prev]);
    }

    lastCheckedAtRef.current = now;
  }, [currentTime, activities]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const dateLabel = currentTime
    ? currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Loading date...';

  const timeLabel = currentTime
    ? currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  const handleAddActivity = () => {
    setSelectedActivity(undefined);
    setIsFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormOpen(true);
  };

  const handleSaveActivity = (activity: Activity) => {
    const normalizedActivity = normalizeActivity(activity);

    setActivities((prev) => {
      const existing = prev.find((a) => a.id === normalizedActivity.id);

      if (existing) {
        return prev.map((a) => (a.id === normalizedActivity.id ? normalizedActivity : a));
      }

      return [...prev, normalizedActivity];
    });

    setIsFormOpen(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    setHistory((prev) => prev.filter((entry) => entry.activityId !== activityId));
  };

  return (
    <div className="flex h-screen bg-background font-sans selection:bg-primary/20">
      <Sidebar currentPage={currentPage} />

      <div className="flex-1 overflow-auto relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {currentPage === 'dashboard' && (
          <div className="p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <h2 className="font-display text-5xl font-black tracking-tight text-foreground mb-2">
                    My <span className="text-gradient">Schedule</span>
                  </h2>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {dateLabel}
                  </p>
                </div>
                <Button
                  onClick={handleAddActivity}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-lg font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Add Task
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 xl:col-span-4 flex justify-center sticky top-12">
                  <CircularClock 
                    activities={activities} 
                    currentTime={currentTime} 
                    onRing={(activity) => playRingSound(activity.ringTimes)}
                  />
                </div>

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-foreground">
                          Today&apos;s Timeline
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                          You have {activities.length} tasks scheduled for today
                        </p>
                      </div>
                      <div className="glass px-4 py-2 rounded-xl text-sm font-bold text-primary">
                        {timeLabel}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Timeline
                        activities={activities}
                        onEdit={handleEditActivity}
                        onDelete={handleDeleteActivity}
                        onRing={(activity) => playRingSound(activity.ringTimes)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'history' && (
          <section className="p-8" aria-labelledby="history-heading">
            <div className="max-w-4xl mx-auto">
              <h2 id="history-heading" className="text-3xl font-bold text-gray-900 mb-6">
                History
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                {history.length === 0 ? (
                  <p className="text-gray-500">
                    No task history is available yet. Activities will be saved here when their
                    start time arrives.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {history.map((entry) => (
                      <li key={entry.id} className="rounded-lg border border-gray-100 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{entry.activityName}</p>
                            <p className="text-sm text-gray-500">
                              Started at{' '}
                              {new Date(entry.triggeredAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}{' '}
                              on {new Date(entry.triggeredAt).toLocaleDateString('en-US')}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {currentPage === 'settings' && (
          <section className="p-8" aria-labelledby="settings-heading">
            <div className="max-w-4xl mx-auto">
              <h2 id="settings-heading" className="text-3xl font-bold text-gray-900 mb-6">
                Settings
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ring Sound</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Preview the alert sound used when a task starts.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => playRingSound()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Test Ring Sound
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <ActivityForm
        activity={selectedActivity}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveActivity}
      />
    </div>
  );
}
