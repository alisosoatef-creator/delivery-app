import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#06070a" },
        headerTintColor: "#f8f6ef",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#06070a" }
      }}
    >
      <Stack.Screen name="index" options={{ title: "وصل" }} />
    </Stack>
  );
}
