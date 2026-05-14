"use client";

import * as React from "react";
import { Pencil, Trash2, Clock3, CalendarDays } from "lucide-react";

import type { Activity } from '@/types/activity';

interface TimelineProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onRing: (activity: Activity) => void;
}

function formatClockTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function Timeline({ activities, onEdit, onDelete, onRing }: TimelineProps) {
  const sorted = React.useMemo(
    () =>
      [...activities].sort((a, b) => {
        const aStart = a.startHour * 60 + a.startMinute;
        const bStart = b.startHour * 60 + b.startMinute;
        return aStart - bStart;
      }),
    [activities],
  );

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="font-display text-xl font-bold mb-2">No activities yet</h4>
        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
          Add your first task to see it on the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((activity) => (
        <div 
          key={activity.id} 
          className="glass group flex items-center gap-6 p-6 rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-primary/20"
        >
          <div className="relative flex items-center justify-center">
            {/* Visual Ring Access */}
            <svg className="absolute w-16 h-16 -rotate-90 pointer-events-none">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={activity.color}
                strokeWidth="2"
                strokeDasharray={`${(activity.ringTimes / 6) * 176} 176`}
                strokeLinecap="round"
                className="opacity-20 group-hover:opacity-100 transition-all duration-500"
                style={{ filter: `drop-shadow(0 0 8px ${activity.color})` }}
              />
            </svg>

            <div 
              className="h-16 w-1 h-full rounded-full absolute -left-6 top-0 transition-all duration-300 group-hover:scale-y-110" 
              style={{ backgroundColor: activity.color, boxShadow: `0 0 15px ${activity.color}` }}
            />
            <div 
              className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-12 relative z-10"
              style={{ backgroundColor: `${activity.color}15`, border: `1px solid ${activity.color}33` }}
            >
              <Clock3 className="h-6 w-6" style={{ color: activity.color }} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {activity.name}
              </h4>
              <button
                onClick={() => onRing(activity)}
                className="px-2 py-0.5 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all active:scale-95 flex items-center gap-1"
                title="Preview Ring Sound"
              >
                <Clock3 className="w-3 h-3" />
                Ring: {activity.ringTimes}x
              </button>
            </div>
            <p className="text-muted-foreground font-semibold flex items-center gap-2">
              <span className="text-foreground tracking-tight">
                {formatClockTime(activity.startHour, activity.startMinute)}
              </span>
              <span className="w-4 h-[2px] bg-muted/30 rounded-full" />
              <span className="text-foreground tracking-tight">
                {formatClockTime(activity.endHour, activity.endMinute)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button
              onClick={() => onEdit(activity)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"
              aria-label={`Edit ${activity.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-90"
              aria-label={`Delete ${activity.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
