import { View, Platform, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import React from "react";
import gs, { appBackground } from "../../assets/styles/globalStyles";

const Layout = () => {
  return (
    <View style={[gs.appBackground, gs.flex1, gs.justify_center]}>
      <View style={styles.statusBar} />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: appBackground,
            },
            headerTintColor: "chocolate",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{}} />
        </Stack>
      </View>
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({
  statusBar: {
    height: Platform.OS === "android" ? 30 : 0,
  },
});
