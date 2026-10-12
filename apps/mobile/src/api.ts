import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const SERVER_URL_KEY = "carecircle:serverUrl";
const ELDER_ID_KEY = "carecircle:elderId";

// Point this at the machine running the admin web app, e.g. http://192.168.1.20:3000
export const DEFAULT_SERVER_URL = "http://localhost:3000";

export async function getServerUrl(): Promise<string> {
  return (await AsyncStorage.getItem(SERVER_URL_KEY)) || DEFAULT_SERVER_URL;
}

export async function setServerUrl(url: string) {
  await AsyncStorage.setItem(SERVER_URL_KEY, url.replace(/\/$/, ""));
}

export async function getElderId(): Promise<string | null> {
  return AsyncStorage.getItem(ELDER_ID_KEY);
}

export async function setElderId(id: string) {
  await AsyncStorage.setItem(ELDER_ID_KEY, id);
}

export async function clearElderId() {
  await AsyncStorage.removeItem(ELDER_ID_KEY);
}

async function client() {
  const baseURL = await getServerUrl();
  return axios.create({ baseURL, timeout: 10000 });
}

export type Elder = { id: string; name: string; avatarColor: string };

export type Reminder = {
  id: string;
  type: string;
  label: string;
  time: string;
  question: string;
  active: boolean;
};

export type CheckIn = {
  id: string;
  status: string;
  scheduledFor: string;
  response: string | null;
};

export type TodayItem = { reminder: Reminder; checkIn: CheckIn };

export async function fetchElders(): Promise<Elder[]> {
  const api = await client();
  const { data } = await api.get("/api/elders");
  return data.elders;
}

export async function fetchToday(elderId: string): Promise<{ elder: Elder; items: TodayItem[] }> {
  const api = await client();
  const { data } = await api.get("/api/mobile/today", { params: { elderId } });
  return data;
}

export async function respondToCheckIn(
  checkInId: string,
  status: "DONE_ON_TIME" | "SKIPPED",
  response: "yes" | "no"
) {
  const api = await client();
  const { data } = await api.patch(`/api/checkins/${checkInId}`, { status, response });
  return data.checkIn as CheckIn;
}

export async function submitMood(elderId: string, mood: "great" | "okay" | "not_great") {
  const api = await client();
  const { data } = await api.post("/api/mood", { elderId, mood });
  return data.moodLog;
}
