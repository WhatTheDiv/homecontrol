import { Stack } from "expo-router";
import React, { useState } from "react";
import Store from "../js/store/store";
import { Provider } from "react-redux";

const RootLayout = () => {
  console.log("");
  console.log("------ App Start ------");
  console.log("");
  return (
    <Provider store={Store}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="fallback" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
};

export default RootLayout;
