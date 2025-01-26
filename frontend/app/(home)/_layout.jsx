import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const HomeLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="tenantHome" options={{ headerShown: false }} />
        <Stack.Screen name="landlordHome" options={{ headerShown: false }} />
      </Stack>
      <StatusBar />
    </>
  );
};

export default HomeLayout;
