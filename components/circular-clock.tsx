"use client";

import * as React from "react";

import type { Activity } from '@/types/activity';

interface CircularClockProps {
  activities: Activity[];
  currentTime: Date | null;
  onRing?: (activity: Activity) => void;
}

function toSvgCoord(value: number) {
  return Number(value.toFixed(3));
}

function formatTime(date: Date | null) {
  if (!date) {
    return "--:--:--";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatClockTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function CircularClock({ activities, currentTime, onRing }: CircularClockProps) {
  const hour = currentTime?.getHours() ?? 0;
  const minute = currentTime?.getMinutes() ?? 0;
  const second = currentTime?.getSeconds() ?? 0;
  
  const hourDegrees = ((hour % 12) + minute / 60) / 12 * 360;
  const minuteDegrees = (minute + second / 60) / 60 * 360;
  const secondDegrees = second / 60 * 360;

  return (
    <div className="glass w-full max-w-sm rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      <div className="mx-auto relative h-64 w-64 group">
        {/* Outer Glow */}
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Clock outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-inner border border-white/50 dark:border-white/10" />
        
        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary z-30 shadow-lg shadow-primary/50 border-2 border-white dark:border-gray-900" />
        
        {/* SVG for markers and numbers */}
        <svg viewBox="0 0 256 256" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="hourGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Ticks */}
          {[...Array(60)].map((_, i) => {
            const angle = (i / 60) * 360 - 90;
            const isHour = i % 5 === 0;
            const length = isHour ? 12 : 6;
            const width = isHour ? 3 : 1.5;
            const startRadius = 110 - length;
            const x1 = 128 + startRadius * Math.cos((angle * Math.PI) / 180);
            const y1 = 128 + startRadius * Math.sin((angle * Math.PI) / 180);
            const x2 = 128 + 110 * Math.cos((angle * Math.PI) / 180);
            const y2 = 128 + 110 * Math.sin((angle * Math.PI) / 180);
            
            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHour ? "var(--color-primary)" : "var(--color-muted-foreground)"}
                strokeWidth={width}
                strokeLinecap="round"
                className="opacity-40"
              />
            );
          })}
          
          {/* Task Arcs (Rings) */}
          {activities.map((activity) => {
            const startTotalMinutes = (activity.startHour % 12) * 60 + activity.startMinute;
            const endTotalMinutes = (activity.endHour % 12) * 60 + (activity.endMinute ?? 0);
            
            // Handle cross-12h cases (simplistic for 12h clock)
            let startAngle = (startTotalMinutes / (12 * 60)) * 360 - 90;
            let endAngle = (endTotalMinutes / (12 * 60)) * 360 - 90;
            
            if (endAngle < startAngle) endAngle += 360;

            // Radius for the arc (just inside the ticks)
            const radius = 100;
            const x1 = 128 + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 128 + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 128 + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 128 + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
            
            return (
              <path
                key={`arc-${activity.id}`}
                d={`M ${toSvgCoord(x1)} ${toSvgCoord(y1)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${toSvgCoord(x2)} ${toSvgCoord(y2)}`}
                fill="none"
                stroke={activity.color}
                strokeWidth="6"
                strokeLinecap="round"
                className="opacity-30 transition-all duration-500 hover:opacity-80 cursor-help"
                style={{ filter: `drop-shadow(0 0 5px ${activity.color}66)` }}
              >
                <title>{activity.name}: {formatClockTime(activity.startHour, activity.startMinute)} - {formatClockTime(activity.endHour, activity.endMinute)}</title>
              </path>
            );
          })}

          {/* Hour numbers */}
          {[...Array(12)].map((_, i) => {
            const hourNum = i + 1;
            const angle = (hourNum / 12) * 360 - 90;
            const radius = 85;
            const x = 128 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 128 + radius * Math.sin((angle * Math.PI) / 180);
            return (
              <text
                key={hourNum}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground font-display text-lg font-bold"
                style={{ filter: 'url(#shadow)' }}
              >
                {hourNum}
              </text>
            );
          })}
        </svg>

        {/* Hands Container */}
        <div className="absolute inset-0 z-20">
          <svg viewBox="0 0 256 256" className="w-full h-full">
            {/* Hour hand */}
            <line
              x1="128"
              y1="128"
              x2="128"
              y2="60"
              stroke="url(#hourGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                transform: `rotate(${hourDegrees}deg)`,
                transformOrigin: '128px 128px',
                transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)'
              }}
            />
            
            {/* Minute hand */}
            <line
              x1="128"
              y1="128"
              x2="128"
              y2="35"
              stroke="var(--color-foreground)"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-80"
              style={{
                transform: `rotate(${minuteDegrees}deg)`,
                transformOrigin: '128px 128px',
                transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)'
              }}
            />
            
            {/* Second hand */}
            <line
              x1="128"
              y1="128"
              x2="128"
              y2="30"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transform: `rotate(${secondDegrees}deg)`,
                transformOrigin: '128px 128px',
              }}
            />
          </svg>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h3 className="font-display text-3xl font-black tracking-tight text-gradient">
          {formatTime(currentTime)}
        </h3>
        <div className="mt-2 h-1 w-12 bg-primary/20 rounded-full mx-auto" />
      </div>

      <div className="mt-8 space-y-3">
        {activities.length > 0 && (
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Upcoming</p>
        )}
        {activities.slice(0, 3).map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border border-white/10 group hover:bg-secondary transition-all">
            <div 
              className="h-3 w-3 rounded-full shadow-lg group-hover:scale-125 transition-transform" 
              style={{ backgroundColor: activity.color, boxShadow: `0 0 10px ${activity.color}44` }} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{activity.name}</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {formatClockTime(activity.startHour, activity.startMinute)} - {formatClockTime(activity.endHour, activity.endMinute)}
              </p>
            </div>
            {onRing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRing(activity);
                }}
                className="px-2 py-1 flex items-center gap-1 rounded-xl bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground active:scale-90 text-[10px] font-bold"
                title="Preview Ring"
              >
                <Clock3 className="h-3 w-3" />
                {activity.ringTimes}x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
