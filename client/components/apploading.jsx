import { StyleSheet, Text, View, Animated, Easing } from "react-native";
import React, { useEffect, useRef } from "react";
import gs from "../assets/styles/globalStyles";

const apploading = () => {
  const av = {
    c1: useRef(new Animated.Value(1)).current,
    c2: useRef(new Animated.Value(1)).current,
    c3: useRef(new Animated.Value(1)).current,
    c4: useRef(new Animated.Value(1)).current,
    c5: useRef(new Animated.Value(1)).current,
  };

  useEffect(() => {
    startAnimation(av);
  }, []);

  return (
    <View style={[gs.align_center]}>
      <View style={[styles.container]}>
        <Animated.View
          style={[
            styles.circles,
            gs.border_orange,
            {
              transform: [{ scale: av.c1 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circles,
            gs.border_green,
            {
              transform: [{ scale: av.c2 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circles,
            gs.border_yellow,
            {
              transform: [{ scale: av.c3 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circles,
            gs.border_cyan,
            {
              transform: [{ scale: av.c4 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circles,
            gs.border_pink,
            {
              transform: [{ scale: av.c5 }],
            },
          ]}
        />
        <Text style={[gs.text_white, gs.text_large, gs.text_center]}>
          Loading ...
        </Text>
      </View>
      <View>
        <Text style={[gs.text_white]}></Text>
      </View>
    </View>
  );
};

const startAnimation = (av) => {
  Animated.loop(
    Animated.timing(av.c1, {
      toValue: 1.5,
      delay: 100,
      duration: 1000,
      useNativeDriver: true,
    })
  ).start();
  Animated.loop(
    Animated.timing(av.c2, {
      toValue: 1.5,
      delay: 200,
      duration: 1000,
      useNativeDriver: true,
    })
  ).start();
  Animated.loop(
    Animated.timing(av.c3, {
      toValue: 1.5,
      delay: 300,
      duration: 1000,
      useNativeDriver: true,
    })
  ).start();
  Animated.loop(
    Animated.timing(av.c4, {
      toValue: 1.5,
      delay: 400,
      duration: 1000,
      useNativeDriver: true,
    })
  ).start();
  Animated.loop(
    Animated.timing(av.c5, {
      toValue: 1.5,
      delay: 500,
      duration: 1000,
      useNativeDriver: true,
    })
  ).start();
};

export default apploading;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 240,
    height: 240,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  circles: {
    width: 160,
    height: 160,
    borderRadius: 80,
    position: "absolute",
    top: 40,
    left: 40,
  },
});
