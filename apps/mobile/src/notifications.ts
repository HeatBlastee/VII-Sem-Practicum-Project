import Constants, { ExecutionEnvironment } from "expo-constants";
import type { Reminder } from "./api";

// Expo Go (SDK 53+) no longer supports expo-notifications (local or remote) at all —
// it throws/warns as soon as you touch the module. Real reminder notifications need a
// development build (`npx expo run:android` / `eas build --profile development`).
// Until then, Expo Go just skips scheduling silently so the rest of the app keeps working.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (isExpoGo) return false;
  const Notifications = await import("expo-notifications");
  const Device = await import("expo-device");
  if (!Device.isDevice) return true; // simulators: skip the hard requirement
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function setupAndroidChannel() {
  if (isExpoGo) return;
  const Notifications = await import("expo-notifications");
  const { Platform } = await import("react-native");
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Care reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }
}

// Cancels everything and re-schedules one repeating daily notification per active reminder.
export async function syncDailyReminderNotifications(reminders: Reminder[]) {
  if (isExpoGo) return;
  const Notifications = await import("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of reminders.filter((r) => r.active)) {
    const [hour, minute] = reminder.time.split(":").map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.label,
        body: reminder.question,
        data: { reminderId: reminder.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

export function notificationsAvailable(): boolean {
  return !isExpoGo;
}
