import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SavedProvider } from "./Camera/context/SavedContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SavedProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SavedProvider>
    </GestureHandlerRootView>
  );
}