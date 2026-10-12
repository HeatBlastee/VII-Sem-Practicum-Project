import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DEFAULT_SERVER_URL, Elder, fetchElders, setElderId, setServerUrl } from "../api";

export function SetupScreen({ onDone }: { onDone: () => void }) {
  const [serverUrl, setServerUrlInput] = useState(DEFAULT_SERVER_URL);
  const [elders, setElders] = useState<Elder[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      await setServerUrl(serverUrl);
      const list = await fetchElders();
      setElders(list);
      if (list.length === 0) {
        Alert.alert("No profiles found", "Ask your family to add you in the admin dashboard first.");
      }
    } catch (e) {
      Alert.alert("Couldn't connect", "Check the address and that the admin dashboard is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePick(elder: Elder) {
    await setElderId(elder.id);
    onDone();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Let's connect this app to your family's dashboard.</Text>

      <Text style={styles.label}>Server address</Text>
      <TextInput
        style={styles.input}
        value={serverUrl}
        onChangeText={setServerUrlInput}
        placeholder="http://192.168.1.20:3000"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.bigButton} onPress={handleConnect} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigButtonText}>Connect</Text>}
      </TouchableOpacity>

      {elders && (
        <View style={styles.list}>
          <Text style={styles.label}>Which one is you?</Text>
          {elders.map((elder) => (
            <TouchableOpacity
              key={elder.id}
              style={[styles.elderRow, { borderColor: elder.avatarColor }]}
              onPress={() => handlePick(elder)}
            >
              <View style={[styles.avatar, { backgroundColor: elder.avatarColor }]}>
                <Text style={styles.avatarText}>{elder.name.slice(0, 1)}</Text>
              </View>
              <Text style={styles.elderName}>{elder.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 72 },
  title: { fontSize: 32, fontWeight: "700", color: "#1e293b" },
  subtitle: { fontSize: 18, color: "#64748b", marginTop: 8, marginBottom: 32 },
  label: { fontSize: 16, fontWeight: "600", color: "#334155", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 20,
  },
  bigButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  bigButtonText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  list: { marginTop: 32 },
  elderRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  elderName: { fontSize: 20, fontWeight: "600", marginLeft: 14, color: "#1e293b" },
});
