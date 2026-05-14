"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Clock3, Settings } from "lucide-react";

interface SidebarProps {
  currentPage: string;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Clock3, href: "/" },
  { id: "history", label: "History", icon: CalendarDays, href: "/history" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({ currentPage }: SidebarProps) {
  return (
    <aside className="w-72 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col h-full" aria-label="Primary sidebar">
      <div className="p-8 pb-12">
        <h1 className="font-display text-2xl font-black tracking-tighter text-gradient flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Clock3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span>Clock<span className="text-foreground">SaaS</span></span>
        </h1>
      </div>
      <nav className="flex-1 space-y-2 px-4" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-1'
              }`}
              title={item.label}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1 text-center">Pro Plan</p>
          <p className="text-[10px] text-muted-foreground text-center mb-3">Unlimited tasks & custom sounds</p>
          <button className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold hover:scale-105 transition-transform">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
