export interface Activity {
  id: string;
  name: string;
  color: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  ringTimes: number;
}

export interface ActivityHistoryEntry {
  id: string;
  activityId: string;
  activityName: string;
  triggeredAt: string;
}
