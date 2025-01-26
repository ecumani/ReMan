import { Stack } from "expo-router";

const Rootlayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen
          name="landlordPayments"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="tenantPayments" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default Rootlayout;
