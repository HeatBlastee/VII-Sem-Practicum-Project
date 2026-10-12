import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchToday, respondToCheckIn, submitMood, TodayItem } from "../api";
import {
  ensureNotificationPermission,
  notificationsAvailable,
  setupAndroidChannel,
  syncDailyReminderNotifications,
} from "../notifications";

const TYPE_EMOJI: Record<string, string> = {
  MEDICINE: "💊",
  MEAL: "🍽️",
  SLEEP: "🌙",
  WAKE: "☀️",
  CUSTOM: "🔔",
};

const MOODS: { key: "great" | "okay" | "not_great"; emoji: string; label: string }[] = [
  { key: "great", emoji: "😄", label: "Great" },
  { key: "okay", emoji: "🙂", label: "Okay" },
  { key: "not_great", emoji: "😕", label: "Not great" },
];

export function HomeScreen({ elderId, onSwitchProfile }: { elderId: string; onSwitchProfile: () => void }) {
  const [elderName, setElderName] = useState("");
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moodSent, setMoodSent] = useState(false);

  const load = useCallback(async () => {
    const { elder, items } = await fetchToday(elderId);
    setElderName(elder.name);
    setItems(items);
    await ensureNotificationPermission();
    await setupAndroidChannel();
    await syncDailyReminderNotifications(items.map((i) => i.reminder));
  }, [elderId]);

  const remindersScheduled = notificationsAvailable();

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function answer(item: TodayItem, yes: boolean) {
    const updated = await respondToCheckIn(
      item.checkIn.id,
      yes ? "DONE_ON_TIME" : "SKIPPED",
      yes ? "yes" : "no"
    );
    setItems((prev) =>
      prev.map((i) => (i.checkIn.id === item.checkIn.id ? { ...i, checkIn: updated } : i))
    );
  }

  async function pickMood(mood: "great" | "okay" | "not_great") {
    await submitMood(elderId, mood);
    setMoodSent(true);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.greeting}>
        {greeting}, {elderName.split(" ")[0]}!
      </Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </Text>

      {!remindersScheduled && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Reminder pop-ups aren't available in Expo Go. Open this app to check today's list, or
            build a development build to get real notifications.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>How are you feeling today?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => (
          <TouchableOpacity key={m.key} style={styles.moodButton} onPress={() => pickMood(m.key)}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={styles.moodLabel}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {moodSent && <Text style={styles.moodSent}>Thanks for letting us know! 💛</Text>}

      <Text style={styles.sectionTitle}>Today's check-ins</Text>
      {items.length === 0 && (
        <Text style={styles.empty}>No reminders scheduled for today. Enjoy your day!</Text>
      )}

      {items.map((item) => {
        const answered = item.checkIn.status !== "PENDING";
        const saidYes = item.checkIn.response === "yes";
        return (
          <View key={item.checkIn.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{TYPE_EMOJI[item.reminder.type] ?? "🔔"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTime}>{item.reminder.time}</Text>
                <Text style={styles.cardLabel}>{item.reminder.label}</Text>
              </View>
            </View>
            <Text style={styles.cardQuestion}>{item.reminder.question}</Text>

            {answered ? (
              <View style={[styles.answeredPill, saidYes ? styles.pillYes : styles.pillNo]}>
                <Text style={styles.answeredText}>{saidYes ? "You said Yes ✓" : "You said No"}</Text>
              </View>
            ) : (
              <View style={styles.answerRow}>
                <TouchableOpacity
                  style={[styles.answerButton, styles.yesButton]}
                  onPress={() => answer(item, true)}
                >
                  <Text style={styles.answerButtonText}>Yes ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.answerButton, styles.noButton]}
                  onPress={() => answer(item, false)}
                >
                  <Text style={styles.answerButtonText}>Not yet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.switchProfile} onPress={onSwitchProfile}>
        <Text style={styles.switchProfileText}>Switch profile / server</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" },
  greeting: { fontSize: 30, fontWeight: "700", color: "#1e293b" },
  date: { fontSize: 16, color: "#64748b", marginTop: 4 },
  notice: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  noticeText: { fontSize: 14, color: "#92400e", lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#334155", marginTop: 28, marginBottom: 12 },
  moodRow: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  moodButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  moodEmoji: { fontSize: 32 },
  moodLabel: { marginTop: 6, fontSize: 14, fontWeight: "600", color: "#475569" },
  moodSent: { marginTop: 10, fontSize: 14, color: "#16a34a", fontWeight: "600" },
  empty: { fontSize: 16, color: "#64748b" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardEmoji: { fontSize: 34 },
  cardTime: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  cardLabel: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  cardQuestion: { fontSize: 18, color: "#334155", marginTop: 14, marginBottom: 16 },
  answerRow: { flexDirection: "row", gap: 12 },
  answerButton: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  yesButton: { backgroundColor: "#16a34a" },
  noButton: { backgroundColor: "#f1f5f9" },
  answerButtonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  answeredPill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  pillYes: { backgroundColor: "#dcfce7" },
  pillNo: { backgroundColor: "#f1f5f9" },
  answeredText: { fontSize: 15, fontWeight: "700", color: "#166534" },
  switchProfile: { marginTop: 24, alignItems: "center" },
  switchProfileText: { color: "#94a3b8", fontSize: 14 },
});
