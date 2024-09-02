// @ts-nocheck
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import gs, {
  f_err,
  greenColor,
  orangeColor,
} from "../../../assets/styles/globalStyles";
import React, { useState, useEffect } from "react";
import RequestTv from "../../../js/serverRequests/request_tv";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import { setTvState } from "../../../js/store/tv_slice";

const rippleColor = "green";

const remote = () => {
  const btnTxtSize = gs.text_medium;
  const btnTxtColor = gs.text_white;

  const dispatch = useDispatch();

  const [tvState, _setTvState] = useState(useSelector((state) => state.tv));

  const statusButtonFlash = useSharedValue(false);

  useEffect(() => {}, []);

  console.log({
    isHome: tvState.input.name?.toLowerCase().indexOf("menu") >= 0,
    inputname: tvState.input.name?.toLowerCase(),
    tvState,
  });

  const statusButton_AnimationStyle = useAnimatedStyle(() => ({
    opacity: statusButtonFlash.value
      ? withRepeat(
          withSequence(
            withTiming(1, { duration: 25 }),
            withTiming(0, { duration: 50 })
          ),
          4,
          false,
          () => {
            statusButtonFlash.value = false;
          }
        )
      : 0,
  }));

  const bus = {
    statusButtonFlash,
    tvState,
    _setTvState,
    dispatch,
  };

  useEffect(() => {
    console.log("Updating tv state with server.");
    // updateTvState(bus);
  }, []);

  return (
    <ScrollView style={[{ position: "relative" }]}>
      <View
        style={[
          gs.width100,
          gs.align_center,
          gs.paddingH10,
          { position: "absolute" },
        ]}
      >
        <Animated.View
          style={[
            gs.background_orange,
            gs.width100,
            statusButton_AnimationStyle,
            {
              borderRadius: 3,
              height: 10,
            },
          ]}
        />
      </View>
      <View style={[gs.flex1, gs.justify_center, gs.align_center]}>
        {/* Power */}
        <View style={[gs.flex_row, styles.tv_section]}>
          {/* - - - - - - - - - - - - - - - - - - - POWER - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              { borderColor: tvState.power ? orangeColor : "gray" },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "power")}
          >
            <Text style={[btnTxtSize, gs.text_white]}>Power</Text>
          </Pressable>
        </View>
        {/* Back, Home */}
        <View style={[gs.flex_row, styles.tv_section]}>
          {/* - - - - - - - - - - - - - - - - - - - BACK - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[styles.tv_button]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "back")}
          >
            <Text style={[btnTxtColor]}>Back</Text>
          </Pressable>
          {/* - - - - - - - - - - - - - - - - - - - HOME - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              {
                borderColor:
                  tvState.power &&
                  tvState.input.name?.toLowerCase().indexOf("menu") >= 0
                    ? orangeColor
                    : "gray",
              },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "home")}
          >
            <Text style={[btnTxtColor]}>Home</Text>
          </Pressable>
        </View>
        {/* Directionals */}
        <View style={[gs.flex_row, gs.align_center, styles.tv_section]}>
          <View>
            {/* - - - - - - - - - - - - - - - - - - - LEFT - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "left")}
            >
              <Text style={[btnTxtColor, btnTxtSize]}>Left</Text>
            </Pressable>
          </View>
          <View>
            {/* - - - - - - - - - - - - - - - - - - - UP - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "up")}
            >
              <Text style={[btnTxtColor, btnTxtSize]}>Up</Text>
            </Pressable>
            {/* - - - - - - - - - - - - - - - - - - - SELECT - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "select")}
            >
              <Text style={[btnTxtColor, btnTxtSize]}>Select</Text>
            </Pressable>
            {/* - - - - - - - - - - - - - - - - - - - DOWN - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "down")}
            >
              <Text style={[btnTxtColor, btnTxtSize]}>Down</Text>
            </Pressable>
          </View>
          <View>
            {/* - - - - - - - - - - - - - - - - - - - RIGHT - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "right")}
            >
              <Text style={[btnTxtColor, btnTxtSize]}>Right</Text>
            </Pressable>
          </View>
        </View>
        {/* Volume */}
        <View style={[gs.flex_row, gs.align_center, styles.tv_section]}>
          {/* - - - - - - - - - - - - - - - - - - - VOLUME DOWN - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[styles.tv_button]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "volDown")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Vol. Down</Text>
          </Pressable>
          {/* - - - - - - - - - - - - - - - - - - - MUTE - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[styles.tv_button]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "mute")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Mute</Text>
          </Pressable>
          {/* - - - - - - - - - - - - - - - - - - - VOLUME UP - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[styles.tv_button]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "volUp")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Vol. Up</Text>
          </Pressable>
        </View>
        {/* Quick Link */}
        <View style={[gs.flex_row, gs.align_center, styles.tv_section]}>
          {/* - - - - - - - - - - - - - - - - - - - PLEX - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              {
                borderColor:
                  tvState.power &&
                  tvState.input.name?.toLowerCase().indexOf("plex") >= 0
                    ? orangeColor
                    : "gray",
              },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "shortcut-plex")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Plex</Text>
          </Pressable>
          {/* - - - - - - - - - - - - - - - - - - - XBOX - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              {
                borderColor:
                  tvState.power &&
                  tvState.input.name?.toLowerCase().indexOf("xbox") >= 0
                    ? orangeColor
                    : "gray",
              },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "shortcut-xbox")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Xbox</Text>
          </Pressable>
          {/* - - - - - - - - - - - - - - - - - - - CHROMECAST - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              {
                borderColor:
                  tvState.power &&
                  tvState.input.name?.toLowerCase().indexOf("chromecast") >= 0
                    ? orangeColor
                    : "gray",
              },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "shortcut-chromecast")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Chromecast</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default remote;

const pressButton = async (
  { statusButtonFlash, tvState, _setTvState, dispatch },
  button
) => {
  const response = await RequestTv(button, dispatch);

  // exit early if bad response from server or TV
  if (!response || !response.success) return;

  const { setting, power, input } = response;

  flashStatusButton({ statusButtonFlash });

  // exit early if it is a non-ui button
  if (!setting) return;

  console.log("           --- setting state: ", {
    power,
    input,
  });

  _setTvState((oldState) => ({
    ...oldState,
    power,
    input,
  }));
  dispatch(setTvState({ power, input }));
};

const flashStatusButton = ({ statusButtonFlash }) =>
  (statusButtonFlash.value = true);

const styles = StyleSheet.create({
  flasher: {},
  tv_button: {
    borderWidth: 1,
    borderColor: "gray",
    width: 100,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  tv_section: {
    marginVertical: 20,
  },
});
