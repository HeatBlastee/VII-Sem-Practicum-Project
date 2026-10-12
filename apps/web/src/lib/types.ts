export const REMINDER_TYPES = ["MEDICINE", "MEAL", "SLEEP", "WAKE", "CUSTOM"] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const CHECKIN_STATUSES = [
  "PENDING",
  "DONE_ON_TIME",
  "DONE_LATE",
  "MISSED",
  "SKIPPED",
] as const;
export type CheckInStatus = (typeof CHECKIN_STATUSES)[number];

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  MEDICINE: "Medicine",
  MEAL: "Meal",
  SLEEP: "Sleep",
  WAKE: "Wake up",
  CUSTOM: "Custom",
};

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
