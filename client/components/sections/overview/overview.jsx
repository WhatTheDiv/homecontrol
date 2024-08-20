// @ts-nocheck
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import gs, {
  greenColor,
  hot_coldColor,
  mid_coldColor,
  cold_coldColor,
  hot_hotColor,
  cold_hotColor,
  orangeColor,
  text_large,
  text_medium,
  text_xlarge,
} from "../../../assets/styles/globalStyles";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "../../misc/loadingIcon";
import RequestTv from "../../../js/serverRequests/request_tv";
import RequestAudio from "../../../js/serverRequests/request_audio";
import RequestLights from "../../../js/serverRequests/request_lights.js";
import RequestServer from "../../../js/serverRequests/request_initial";
import { setTvState } from "../../../js/store/tv_slice";
import {
  toggleLights_white,
  toggleLights_color,
  lights_setInitial,
} from "../../../js/store/lights_slice";
import { setActive } from "../../../js/store/audio_slice";
const light_actions = {
  toggleLights_white,
  toggleLights_color,
};
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withSequence,
  withRepeat,
} from "react-native-reanimated";

const overview = () => {
  // @ts-ignore
  const weather = useSelector((state) => state.weather);
  const tvPower = useSelector((state) => state.tv.power);
  const tvInput = useSelector((state) => state.tv.input);
  const audio = useSelector((state) => state.audio);
  const { animation_active, lightsOn, animation, updated } = useSelector(
    (state) => state.lights
  );
  const [loading_toggleLights, setLoading_toggleLights] = useState(false);
  const [loading_toggleAudio, setLoading_toggleAudio] = useState(false);

  const AnimatedFlash = useSharedValue(false);
  const AnimatedFlash_style = useAnimatedStyle(() => ({
    opacity: AnimatedFlash.value
      ? withRepeat(
          withSequence(
            withTiming(1, { duration: 25 }),
            withTiming(0, { duration: 50 })
          ),
          4,
          false,
          () => {
            AnimatedFlash.value = false;
          }
        )
      : 0,
  }));

  const AnimatedFade_lights = useSharedValue(1);
  const AnimatedFade_lights_style = useAnimatedStyle(() => ({
    opacity:
      AnimatedFade_lights.value === 1
        ? withTiming(1, { duration: 300 })
        : withTiming(0, { duration: 50 }),
  }));

  const AnimatedFade_audio = useSharedValue(1);
  const AnimatedFade_audio_style = useAnimatedStyle(() => ({
    opacity:
      AnimatedFade_audio.value === 1
        ? withTiming(1, { duration: 300 })
        : withTiming(0, { duration: 50 }),
  }));

  const dispatch = useDispatch();

  const bus = {
    lightsOn,
    animation,
    updated,
    animation_active,
    tvPower,
    tvInput,
    weather,
    audio,
    dispatch,
    AnimatedFlash,
    AnimatedFlash_style,
    AnimatedFade_lights,
    AnimatedFade_lights_style,
    loading_toggleLights,
    setLoading_toggleLights,
    loading_toggleAudio,
    setLoading_toggleAudio,
    AnimatedFade_audio,
    AnimatedFade_audio_style,
  };

  return (
    <ScrollView style={[gs.marginH5, gs.flex1]}>
      {/* Thermostat */}
      {render_temp(bus)}
      {/* TV */}
      {render_tv(bus)}
      {/* lights */}
      {render_lights(bus)}
      {/* Audio */}
      {render_audio(bus)}
      {/* Test */}
      {render_test(bus)}
    </ScrollView>
  );
};

const render_lights = ({
  lightsOn,
  updated,
  animation_active,
  dispatch,
  AnimatedFade_lights,
  AnimatedFade_lights_style,
  loading_toggleLights,
  setLoading_toggleLights,
}) => {
  return (
    <View style={[styles.section, gs.relative]}>
      <Text style={[gs.text_gray, gs.text_center, gs.marginV5]}>Lights</Text>
      {loading_toggleLights && render_loadingIcon()}
      <Animated.View
        style={[
          gs.flex_row,
          gs.justify_between,
          AnimatedFade_lights_style,
          { gap: 5 },
        ]}
      >
        <Pressable
          onPress={() =>
            lights_toggleState(
              "toggleLightsActive",
              lightsOn,
              dispatch,
              AnimatedFade_lights,
              setLoading_toggleLights
            )
          }
          style={[
            !updated
              ? gs.border_gray
              : lightsOn
              ? gs.border_green
              : gs.border_white,
            gs.padding10,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: !updated ? 0.15 : lightsOn ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white]}>
            {lightsOn ? "Turn Off" : "Turn On"}
          </Text>
        </Pressable>
        {lightsOn && (
          <Pressable
            onPress={() =>
              lights_toggleState(
                "setAnimation",
                animation_active,
                dispatch,
                AnimatedFade_lights,
                setLoading_toggleLights
              )
            }
            style={[
              !updated
                ? gs.border_gray
                : animation_active
                ? gs.border_green
                : gs.border_white,
              gs.padding10,
              gs.border_rad5,
              gs.flex1,
              {
                opacity: !updated ? 0.15 : animation_active ? 1 : 0.5,
              },
            ]}
          >
            <Text style={[gs.text_center, gs.text_large, gs.text_white]}>
              {animation_active ? "Stop Animation" : "Animate"}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
};
const render_tv = ({
  tvPower,
  tvInput,
  dispatch,
  AnimatedFlash,
  AnimatedFlash_style,
}) => {
  const bus = {
    dispatch,
    AnimatedFlash,
  };
  return (
    <View style={[styles.section]}>
      <View style={[gs.flex_row, gs.align_center]}>
        <Animated.View
          style={[
            gs.border_rad5,
            gs.background_orange,
            gs.flex1,
            AnimatedFlash_style,
            { height: 10 },
          ]}
        />
        <Text style={[gs.text_white, gs.text_gray, gs.marginV5, gs.marginH10]}>
          TV
        </Text>
        <Animated.View
          style={[
            gs.border_rad5,
            gs.height100,
            gs.background_orange,
            gs.flex1,
            AnimatedFlash_style,
            { height: 10 },
          ]}
        />
      </View>
      <View style={[gs.flex_row, gs.justify_between]}>
        <Pressable
          onPress={() => tv_pressButton("power", bus)}
          style={[
            tvPower ? gs.border_green : gs.border_gray,
            gs.padding10,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: tvPower ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
            Power
          </Text>
        </Pressable>
        <Pressable
          onPress={() => tv_pressButton("shortcut-plex", bus)}
          style={[
            tvPower && tvInput.name?.indexOf("Plex") >= 0
              ? gs.border_green
              : gs.border_gray,
            gs.padding10,
            gs.marginH5,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: tvPower && tvInput.name?.indexOf("Plex") >= 0 ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
            Plex
          </Text>
        </Pressable>
        <Pressable
          onPress={() => tv_pressButton("shortcut-xbox", bus)}
          style={[
            tvPower && tvInput.name?.indexOf("Xbox") >= 0
              ? gs.border_green
              : gs.border_gray,
            gs.padding10,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: tvPower && tvInput.name?.indexOf("Xbox") >= 0 ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
            Xbox
          </Text>
        </Pressable>
      </View>
      <View style={[gs.flex_row, gs.justify_between, gs.marginV5]}>
        <Pressable
          onPress={() => tv_pressButton("volDown", bus)}
          disabled={!tvPower}
          style={[
            tvPower ? gs.border_green : gs.border_gray,
            gs.padding10,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: tvPower ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
            Vol. Down
          </Text>
        </Pressable>
        <Pressable
          onPress={() => tv_pressButton("mute", bus)}
          disabled={!tvPower}
          style={[
            tvPower ? gs.border_green : gs.border_gray,
            gs.padding10,
            gs.marginH5,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: tvPower ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
            Mute
          </Text>
        </Pressable>
        <Pressable
          onPress={() => tv_pressButton("volUp", bus)}
          disabled={!tvPower}
          style={[
            tvPower ? gs.border_green : gs.border_gray,
            gs.padding10,
            gs.border_rad5,
            gs.flex1,
            {
              opacity: tvPower ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
            Vol. Up
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
const render_temp = ({ weather, dispatch }) => {
  const {
    indoorTemp,
    outdoorTemp,
    outdoorHumidity,
    indoorHumidity,
    outdoorTemp_high,
    outdoorTemp_low,
    outdoorTemp_tomorrow_high,
    outdoorTemp_tomorrow_low,
    feels,
  } = weather;

  const determineColor = (val, f, inside = false, humidity = false) => {
    if (val !== 0 && (!val || isNaN(Number(val)))) {
      console.log(`%cnon-number passed to determine color: '${val}'`, {
        color: "blue",
      });
      return f.isWarmDay ? orangeColor : mid_coldColor;
    }

    const feelScale = inside ? f.inside : f.isWarmDay ? f.hotDay : f.coldDay;

    const feelsHot = feelScale.hot;
    const feelsCold = feelScale.cold;

    const v = Number(val);
    const schemeWarm = f.isWarmDay;

    if (humidity) {
      if (v >= feelScale.h_high)
        return inside
          ? hot_hotColor
          : schemeWarm
          ? hot_hotColor
          : hot_coldColor;
      else if (v >= feelScale.h_low)
        return inside ? orangeColor : schemeWarm ? orangeColor : mid_coldColor;
      else return schemeWarm ? cold_hotColor : cold_coldColor;
    }

    if (inside) {
      if (v >= feelScale.tooHot) return hot_hotColor;
      else if (v >= feelScale.hot) return orangeColor;
      else if (v >= feelScale.cold) return cold_hotColor;
      else if (v >= feelScale.tooCold) return mid_coldColor;
      else return cold_coldColor;
    }

    const hotColor = schemeWarm ? hot_hotColor : hot_coldColor;
    const midColor = schemeWarm ? orangeColor : mid_coldColor;
    const coldColor = schemeWarm ? cold_hotColor : cold_coldColor;

    if (v >= feelsHot) return hotColor;
    else if (v <= feelsCold) return coldColor;
    else return midColor;
  };

  return (
    <View style={[styles.section]}>
      <Pressable
        onPress={() => updateAppData(dispatch)}
        style={[styles.sectionDetail]}
      >
        <View
          style={[
            gs.flex_row,
            gs.justify_between,
            gs.width100,
            { marginBottom: 10 },
          ]}
        >
          <View>
            <Text style={[gs.text_gray, gs.text_center]}>Inside Temp</Text>
            <View style={[gs.justify_center]}>
              <Text
                style={[
                  gs.text_xlarge,
                  { color: determineColor(indoorTemp, feels, true) },
                ]}
              >
                {indoorTemp}°
              </Text>
            </View>
          </View>

          <View>
            <Text style={[gs.text_gray, gs.text_center]}>Inside Humidity</Text>
            <View style={[gs.justify_center]}>
              <Text
                style={[
                  gs.text_xlarge,
                  gs.text_center,
                  gs.text_white,
                  { color: determineColor(indoorTemp, feels, true, true) },
                ]}
              >
                {Math.round(indoorHumidity)}%
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={[gs.text_gray, gs.text_center]}>Outside</Text>
            <Text
              style={[
                gs.text_center,
                gs.text_xlarge,
                { color: determineColor(outdoorTemp, feels) },
              ]}
            >
              {outdoorTemp}°
            </Text>
          </View>

          <View>
            <Text style={[gs.text_gray, gs.text_center]}>Outside Humidity</Text>
            <Text
              style={[
                gs.text_center,
                gs.text_xlarge,
                { color: "white" },
                { color: determineColor(outdoorTemp, feels, false, true) },
              ]}
            >
              {outdoorHumidity}%
            </Text>
          </View>

          {/* <View style={styles.divider} /> */}
        </View>

        <View style={[gs.flex_row, gs.justify_around, gs.width100, {}]}>
          <View style={[]}>
            <Text style={[gs.text_gray, gs.text_center]}>Today - L / H</Text>

            <View
              style={[gs.flex_row, gs.justify_center, { height: text_xlarge }]}
            >
              <Text
                style={[
                  gs.text_large,
                  { color: determineColor(outdoorTemp_low, feels) },
                ]}
              >
                {outdoorTemp_low}°
              </Text>
              <Text style={[gs.text_gray, gs.text_medium, gs.paddingH5]}>
                /
              </Text>
              <Text
                style={[
                  gs.text_xlarge,
                  { color: determineColor(outdoorTemp_high, feels) },
                ]}
              >
                {outdoorTemp_high}°
              </Text>
            </View>
          </View>

          {/* <View style={styles.divider} /> */}

          <View style={[gs.justify_between]}>
            <Text style={[gs.text_gray, gs.text_center]}>Tomorrow - L / H</Text>

            <View
              style={[gs.flex_row, gs.justify_center, { height: text_xlarge }]}
            >
              <Text
                style={[
                  gs.text_large,
                  { color: determineColor(outdoorTemp_tomorrow_low, feels) },
                ]}
              >
                {outdoorTemp_tomorrow_low}°
              </Text>
              <Text style={[gs.text_gray, gs.text_medium, gs.paddingH5]}>
                /
              </Text>
              <Text
                style={[
                  gs.text_xlarge,
                  { color: determineColor(outdoorTemp_tomorrow_high, feels) },
                ]}
              >
                {outdoorTemp_tomorrow_high}°
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};
const render_audio = ({
  audio,
  dispatch,
  AnimatedFade_audio,
  AnimatedFade_audio_style,
  loading_toggleAudio,
  setLoading_toggleAudio,
}) => {
  z1 = audio.zone_1;
  z2 = audio.zone_2;
  return (
    <View style={[styles.section, gs.relative]}>
      <Text style={[gs.text_gray, gs.text_center, gs.marginV5]}>Audio</Text>
      {loading_toggleAudio && render_loadingIcon()}
      <Animated.View
        style={[
          gs.flex_row,
          gs.justify_between,
          AnimatedFade_audio_style,
          { gap: 5 },
        ]}
      >
        <View style={[gs.flex1, {}]}>
          <Pressable
            style={[
              gs.flex1,
              z1.active ? gs.border_green : gs.border_gray,
              gs.padding10,
              gs.border_rad5,
              { opacity: z1.updated ? 1 : 0.5 },
            ]}
            onPress={() =>
              audio_toggleZone({
                zone: 1,
                newState: !z1.active,
                dispatch,
                AnimatedFade_audio,
                setLoading_toggleAudio,
              })
            }
          >
            <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
              {z1.name}
            </Text>
          </Pressable>
        </View>
        <View style={[gs.flex1, {}]}>
          <Pressable
            style={[
              gs.flex1,
              z2.active ? gs.border_green : gs.border_gray,
              gs.padding10,
              gs.border_rad5,
              { opacity: z2.updated ? 1 : 0.5 },
            ]}
            onPress={() =>
              audio_toggleZone({
                zone: 2,
                newState: !z2.active,
                dispatch,
                AnimatedFade_audio,
                setLoading_toggleAudio,
              })
            }
          >
            <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
              {z2.name}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};
const render_loadingIcon = () => {
  return (
    <View style={[gs.align_center, gs.absolute, gs.width100, { top: 25 }]}>
      <LoadingIcon sqDim={50} />
    </View>
  );
};
const render_test = () => {
  return (
    <View>
      <View style={[gs.flex_row]}>
        <Pressable
          style={[gs.border_gray]}
          onPress={() => runTest({ learn: true })}
        >
          <Text style={[gs.text_white, gs.text_xlarge, gs.text_center]}>
            Learn
          </Text>
        </Pressable>
        <Pressable
          style={[gs.border_gray]}
          onPress={() => runTest({ report: true })}
        >
          <Text style={[gs.text_white, gs.text_xlarge, gs.text_center]}>
            Report
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const tv_pressButton = async (button, { dispatch, AnimatedFlash }) => {
  console.log("pressing button ... ");
  const response = await RequestTv(button, dispatch);

  if (!response || !response.success) {
    console.log("bad response: ", response);
    return;
  }

  AnimatedFlash.value = true;

  const { setting, power, input } = response;

  if (!setting) return;

  dispatch(setTvState({ power, input }));
  return;
};

const lights_toggleState = async (
  action,
  currState,
  dispatch,
  AnimatedFade_lights,
  setLoading_toggleLights
) => {
  const toggleLightsLoading = (newState, setter) => {
    if (newState) {
      AnimatedFade_lights.value = 0;
      setter(true);
    } else {
      AnimatedFade_lights.value = 1;
      setter(false);
    }
  };

  toggleLightsLoading(true, setLoading_toggleLights);

  const bus = { action, dispatch };

  if (action === "toggleLightsActive") bus.newState = !currState;
  else if (action === "setAnimation")
    bus.animationName = currState ? "defaultOnAnimation" : "defaultAnimation";

  const result = await RequestLights(bus);

  if (!result) {
    toggleLightsLoading(false, setLoading_toggleLights);
    // dispatch(lights_setInitial({ updated: false }));
    return alert("Failed to reach server");
  } else {
    toggleLightsLoading(false, setLoading_toggleLights);
  }
};

const audio_toggleZone = async ({
  zone,
  newState,
  dispatch,
  AnimatedFade_audio,
  setLoading_toggleAudio,
}) => {
  const toggleAudioLoading = (newState, setter) => {
    if (newState) {
      AnimatedFade_audio.value = 0;
      setter(true);
    } else {
      AnimatedFade_audio.value = 1;
      setter(false);
    }
  };

  toggleAudioLoading(true, setLoading_toggleAudio);

  if (await RequestAudio({ zone, newState })) {
    dispatch(
      setActive({
        [`zone${zone}_active`]: newState,
        [`zone${zone}_updated`]: true,
      })
    );
  }

  toggleAudioLoading(false, setLoading_toggleAudio);
};

const updateAppData = async (dispatch) => {
  const response = await RequestServer(dispatch);
};

const runTest = async ({ learn = false, report = false }) => {
  // console.log(
  //   "Test result: ",
  //   await RequestLights({
  //     action: "setColor",
  //     colorLabel: "primary",
  //     rgbw: { r: 10, g: 10, b: 30, w: 11 },
  //   })
  // );
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ learn, report }),
  };

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SERVER_URL}/test`,
    options
  );
  console.log(response);
  const data = await response.json();

  console.log(data);
};

export default overview;

const styles = StyleSheet.create({
  section: {
    marginVertical: 20,
    marginHorizontal: 5,
  },
  display_detail: { fontSize: text_large },
  display_status: { fontSize: text_large },
  weatherFont: {
    color: orangeColor,
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "gray",
  },
});
