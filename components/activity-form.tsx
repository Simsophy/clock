"use client";

import * as React from "react";
import type { Activity } from "@/types/activity";

interface ActivityFormProps {
  activity?: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}

interface FormState {
  name: string;
  color: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  ringTimes: number;
}

const DEFAULT_FORM: FormState = {
  name: "",
  color: "#3B82F6",
  startHour: 9,
  startMinute: 0,
  endHour: 10,
  endMinute: 0,
  ringTimes: 1,
};

function getInitialForm(activity?: Activity): FormState {
  if (!activity) return DEFAULT_FORM;
  return {
    name: activity.name,
    color: activity.color,
    startHour: activity.startHour,
    startMinute: activity.startMinute,
    endHour: activity.endHour,
    endMinute: activity.endMinute,
    ringTimes: activity.ringTimes ?? 1,
  };
}

export function ActivityForm({ activity, isOpen, onClose, onSave }: ActivityFormProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ActivityFormContent
      key={activity?.id ?? "new"}
      activity={activity}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function ActivityFormContent({ activity, onClose, onSave }: Omit<ActivityFormProps, "isOpen">) {
  const [form, setForm] = React.useState<FormState>(() => getInitialForm(activity));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      id: activity?.id ?? String(Date.now()),
      name: form.name.trim(),
      color: form.color,
      startHour: form.startHour,
      startMinute: form.startMinute,
      endHour: form.endHour,
      endMinute: form.endMinute,
      ringTimes: form.ringTimes,
    });
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {activity ? "Edit activity" : "Add activity"}
        </h3>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Name</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Activity name"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Color</span>
            <input
              type="color"
              value={form.color}
              onChange={(event) => updateField("color", event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-1 py-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">Start hour</span>
              <input
                type="number"
                min={0}
                max={23}
                value={form.startHour}
                onChange={(event) => updateField("startHour", Number(event.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">Start minute</span>
              <input
                type="number"
                min={0}
                max={59}
                value={form.startMinute}
                onChange={(event) => updateField("startMinute", Number(event.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">End hour</span>
              <input
                type="number"
                min={0}
                max={23}
                value={form.endHour}
                onChange={(event) => updateField("endHour", Number(event.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700">End minute</span>
              <input
                type="number"
                min={0}
                max={59}
                value={form.endMinute}
                onChange={(event) => updateField("endMinute", Number(event.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-700">Ring times at start</span>
            <input
              type="number"
              min={1}
              max={6}
              value={form.ringTimes}
              onChange={(event) => updateField("ringTimes", Number(event.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
