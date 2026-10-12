import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { clearElderId, getElderId } from "./src/api";
import { SetupScreen } from "./src/screens/SetupScreen";
import { HomeScreen } from "./src/screens/HomeScreen";

export default function App() {
  const [elderId, setElderIdState] = useState<string | null | undefined>(undefined);

  const check = useCallback(async () => {
    setElderIdState(await getElderId());
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function handleSwitchProfile() {
    await clearElderId();
    setElderIdState(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {elderId === undefined ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : elderId ? (
        <HomeScreen elderId={elderId} onSwitchProfile={handleSwitchProfile} />
      ) : (
        <SetupScreen onDone={check} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
