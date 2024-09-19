// @ts-nocheck
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
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
  f_err,
  f_gTitle,
  f_hlt,
} from "../../../assets/styles/globalStyles";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "../../misc/loadingIcon";
import RequestTv from "../../../js/serverRequests/request_tv";
import RequestAudio from "../../../js/serverRequests/request_audio";
import RequestLights, {
  requestLights_animation,
} from "../../../js/serverRequests/request_lights.js";
import RequestServer from "../../../js/serverRequests/request_initial";
import { setTvState } from "../../../js/store/tv_slice";
import {
  toggleLights_white,
  toggleLights_color,
  lights_setInitial,
} from "../../../js/store/lights_slice";
import { setZone } from "../../../js/store/audio_slice";
import { addCommand } from "../../../js/store/ir_slice";
import { SelectList } from "react-native-dropdown-select-list";
import { determineTempColor } from "../../../js/Globals/weather.js";
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
import {
  requestIr_learn,
  requestIr_emit,
  requestIr_custom,
} from "../../../js/serverRequests/request_ir.js";

const overview = () => {
  const dispatch = useDispatch();

  //            Weather variables
  const weather = useSelector((state) => state.weather);

  //            Living Room Tv Variables
  const tvPower = useSelector((state) => state.tv.power);
  const tvInput = useSelector((state) => state.tv.input);
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

  //            Audio Variables
  const [audioZones, setAudioZones] = useState(
    useSelector((state) => state.audio.zones)
  );
  const audioSources = useSelector((state) => state.audio.sources);
  const lastSourceSelected_id = useSelector(
    (state) => state.audio.lastSourceSelected_id
  );
  const audioActive = useSelector((state) => state.audio.active);
  const AnimatedFade_audio = useSharedValue(1);

  //            Lights Variables

  const { animation_active, lightsOn, animation, updated } = useSelector(
    (state) => state.lights
  );
  const [loading_toggleLights, setLoading_toggleLights] = useState(false);
  const [loading_toggleAudio, setLoading_toggleAudio] = useState(false);
  const AnimatedFade_lights = useSharedValue(1);
  const AnimatedFade_lights_style = useAnimatedStyle(() => ({
    opacity:
      AnimatedFade_lights.value === 1
        ? withTiming(1, { duration: 300 })
        : withTiming(0, { duration: 50 }),
  }));

  const bus = {
    lightsOn,
    animation,
    updated,
    animation_active,
    tvPower,
    tvInput,
    weather,
    dispatch,
    AnimatedFlash,
    AnimatedFlash_style,
    AnimatedFade_lights,
    AnimatedFade_lights_style,
    loading_toggleLights,
    setLoading_toggleLights,

    audio: {
      audioZones,
      setAudioZones,
      audioSources,
      lastSourceSelected_id,
      audioActive,
      AnimatedFade_audio,
      loading_toggleAudio,
      setLoading_toggleAudio,
    },
  };

  return (
    <ScrollView style={[gs.marginH5, gs.flex1, { marginBottom: 5 }]}>
      {/* Thermostat */}
      {render_temp(bus)}
      {/* TV */}
      {render_tv(bus)}
      {/* lights */}
      {render_lights(bus)}
      {/* Audio */}
      {audioZones.length >= 1 && render_audio(bus)}
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
              lights_setAnimation({
                newState: !animation_active,
                dispatch,
                AnimatedFade_lights,
                setLoading_toggleLights,
              })
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
          onPress={() => tv_pressButton("Power", bus)}
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
          onPress={() => tv_pressButton("Volume Down", bus)}
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
          onPress={() => tv_pressButton("Mute", bus)}
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
          onPress={() => tv_pressButton("Volume Up", bus)}
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

  // const determineColor = (val, f, inside = false, humidity = false) => {
  //   if (val !== 0 && (!val || isNaN(Number(val)))) {
  //     console.log(`%cnon-number passed to determine color: '${val}'`, {
  //       color: "blue",
  //     });
  //     return f.isWarmDay ? orangeColor : mid_coldColor;
  //   }

  //   const feelScale = inside ? f.inside : f.isWarmDay ? f.hotDay : f.coldDay;

  //   const feelsHot = feelScale.hot;
  //   const feelsCold = feelScale.cold;

  //   const v = Number(val);
  //   const schemeWarm = f.isWarmDay;

  //   if (humidity) {
  //     if (v >= feelScale.h_high)
  //       return inside
  //         ? hot_hotColor
  //         : schemeWarm
  //         ? hot_hotColor
  //         : hot_coldColor;
  //     else if (v >= feelScale.h_low)
  //       return inside ? orangeColor : schemeWarm ? orangeColor : mid_coldColor;
  //     else return schemeWarm ? cold_hotColor : cold_coldColor;
  //   }

  //   if (inside) {
  //     if (v >= feelScale.tooHot) return hot_hotColor;
  //     else if (v >= feelScale.hot) return orangeColor;
  //     else if (v >= feelScale.cold) return cold_hotColor;
  //     else if (v >= feelScale.tooCold) return mid_coldColor;
  //     else return cold_coldColor;
  //   }

  //   const hotColor = schemeWarm ? hot_hotColor : hot_coldColor;
  //   const midColor = schemeWarm ? orangeColor : mid_coldColor;
  //   const coldColor = schemeWarm ? cold_hotColor : cold_coldColor;

  //   if (v >= feelsHot) return hotColor;
  //   else if (v <= feelsCold) return coldColor;
  //   else return midColor;
  // };

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
                  {
                    color: determineTempColor({
                      val: indoorTemp,
                      feelsObj: feels,
                      inside: true,
                    }),
                  },
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
                  {
                    color: determineTempColor({
                      val: indoorHumidity,
                      feelsObj: feels,
                      inside: true,
                      humidity: true,
                    }),
                  },
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
                {
                  color: determineTempColor({
                    val: outdoorTemp,
                    feelsObj: feels,
                  }),
                },
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
                {
                  color: determineTempColor({
                    val: outdoorHumidity,
                    feelsObj: feels,
                    humidity: true,
                  }),
                },
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
                  {
                    color: determineTempColor({
                      val: outdoorTemp_low,
                      feelsObj: feels,
                    }),
                  },
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
                  {
                    color: determineTempColor({
                      val: outdoorTemp_high,
                      feelsObj: feels,
                    }),
                  },
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
                  {
                    color: determineTempColor({
                      val: outdoorTemp_tomorrow_low,
                      feelsObj: feels,
                    }),
                  },
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
                  {
                    color: determineTempColor({
                      val: outdoorTemp_tomorrow_high,
                      feelsObj: feels,
                    }),
                  },
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
const render_audio = ({ audio, dispatch }) => {
  const {
    audioZones,
    setAudioZones,
    audioSources,
    lastSourceSelected_id,
    audioActive,
    AnimatedFade_audio,
    loading_toggleAudio,
    setLoading_toggleAudio,
  } = audio;

  const AnimatedFade_audio_style = useAnimatedStyle(() => ({
    opacity:
      AnimatedFade_audio.value >= 1
        ? withTiming(1, { duration: 300 })
        : withTiming(0, { duration: 50 }),
  }));

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
        {audioZones.map((zone, index) => (
          <View style={[gs.flex1, {}]} key={index}>
            <Pressable
              style={[
                gs.flex1,
                zone.active ? gs.border_green : gs.border_gray,
                gs.padding10,
                gs.border_rad5,
                { opacity: zone.updated ? 1 : 0.5 },
              ]}
              onPress={() =>
                audio_toggleZone({
                  zone,
                  newState: !zone.active,
                  dispatch,
                  AnimatedFade_audio,
                  setLoading_toggleAudio,
                  setAudioZones,
                })
              }
            >
              <Text style={[gs.text_center, gs.text_large, gs.text_white, {}]}>
                {zone.name}
              </Text>
            </Pressable>
          </View>
        ))}
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
// const render_ir = ({ ir, dispatch }) => {
//   const formatted_sources =
//     ir.svs.map((service) => ({
//       key: service.Id,
//       value: service.Source,
//     })) || [];

//   formatted_sources.splice(0, 0, { key: -1, value: "Select Source" });

//   const formatted_commands =
//     ir.sel_source < 0
//       ? []
//       : Object.keys(
//           ir.svs.find((service) => service.Id === ir.sel_source).commands
//         ).map((key) => ({
//           key,
//           value: key,
//         })) || [];

//   formatted_commands.splice(0, 0, { key: -1, value: "Select Command" });

//   return (
//     <View style={[gs.marginV20, { height: 200 }]}>
//       <Text
//         style={[gs.text_medium, gs.text_gray, gs.text_center, gs.paddingV5]}
//       >
//         Ir Commands
//       </Text>
//       <View style={[gs.flex1]}>
//         {ir.irAction === "emit" &&
//           render_ir_emit(ir, dispatch, formatted_sources, formatted_commands)}
//         {ir.irAction === "learn" && render_ir_learn(ir, dispatch)}
//         {ir.irAction === "test" &&
//           render_ir_test(ir, dispatch, formatted_sources)}
//       </View>
//     </View>
//   );
// };
// const render_ir_emit = (
//   {
//     cmds,
//     srcs,
//     svs,
//     lastCommand,
//     sel_source,
//     sel_command,
//     setSel_source,
//     setSel_command,
//     irAction,
//     setIrAction,
//   },
//   dispatch,
//   formatted_sources,
//   formatted_commands
// ) => {
//   return (
//     <View
//       style={[
//         gs.flex_row,
//         gs.marginH5,
//         gs.justify_between,
//         gs.height100,
//         { gap: 10 },
//       ]}
//     >
//       <Pressable
//         style={[
//           gs.border_gray,
//           gs.align_center,
//           gs.justify_center,
//           gs.border_rad5,
//           { width: "15%", height: 50 },
//         ]}
//         onPress={() => setIrAction("learn")}
//       >
//         <Text style={[gs.text_white, gs.text_medium]}>Learn</Text>
//       </Pressable>
//       <SelectList
//         defaultOption={formatted_sources.find(
//           (source) => source.key === sel_source
//         )}
//         setSelected={(key) => {
//           setSel_source(key);
//         }}
//         data={formatted_sources}
//         save="key"
//         boxStyles={[
//           gs.border_gray,
//           gs.border_rad5,
//           gs.paddingH10,
//           gs.align_center,
//           { paddingVertical: 2, height: 50 },
//         ]}
//         inputStyles={[
//           gs.text_gray,
//           gs.text_medium,
//           gs.text_center,
//           { width: 100 },
//         ]}
//         dropdownStyles={[{ maxHeight: 100 }]}
//         dropdownTextStyles={[gs.text_gray]}
//         arrowicon={<View style={[{ width: 0 }]} />}
//         search={false}
//       />
//       <SelectList
//         defaultOption={formatted_commands.find(
//           (command) => command.key === sel_command
//         )}
//         setSelected={(val) => {
//           setSel_command(val);
//         }}
//         data={formatted_commands}
//         save="value"
//         boxStyles={[
//           gs.border_gray,
//           gs.border_rad5,
//           gs.paddingH10,
//           gs.align_center,
//           { paddingVertical: 2, height: 50 },
//         ]}
//         inputStyles={[
//           gs.text_gray,
//           gs.text_medium,
//           gs.text_center,
//           { width: 100 },
//         ]}
//         dropdownStyles={[{ maxHeight: 100 }]}
//         dropdownTextStyles={[gs.text_gray]}
//         arrowicon={<View style={[{ width: 0 }]} />}
//         search={false}
//       />
//       <Pressable
//         style={[
//           gs.background_green,
//           gs.border_rad5,
//           gs.justify_center,
//           gs.align_center,
//           gs.flex_row,
//           { padding: 1, flexGrow: 1, height: 50 },
//         ]}
//         onPress={() =>
//           emitIr({
//             source: svs.find((service) => service.Id === sel_source).Source,
//             commandName: sel_command,
//             dispatch,
//           })
//         }
//       >
//         <View
//           style={[
//             gs.border_black,
//             gs.border_rad5,
//             gs.flex1,
//             gs.justify_center,
//             gs.align_center,
//             {
//               borderWidth: 3,
//               height: "100%",
//             },
//           ]}
//         >
//           <Text style={[gs.text_medium, gs.text_bold]}>Send</Text>
//         </View>
//       </Pressable>
//     </View>
//   );
// };
// const render_ir_learn = (
//   {
//     cmds,
//     srcs,
//     lastCommand,
//     sel_source,
//     sel_command,
//     setSel_source,
//     setSel_command,
//     irAction,
//     setIrAction,
//     irLearnVars,
//     setIrLearnVars,
//   },
//   dispatch
// ) => {
//   return (
//     <View
//       style={[
//         gs.flex_row,
//         gs.marginH5,
//         gs.justify_between,
//         { gap: 10, height: 60, flexWrap: "wrap" },
//       ]}
//     >
//       <Pressable
//         style={[
//           gs.border_gray,
//           gs.border_rad5,
//           gs.align_center,
//           gs.justify_center,
//           { width: "15%" },
//         ]}
//         onPress={() => setIrAction("test")}
//       >
//         <Text style={[gs.text_white, gs.text_medium]}>Test</Text>
//       </Pressable>
//       <TextInput
//         style={[
//           gs.marginH10,
//           gs.text_orange,
//           gs.text_center,
//           gs.text_medium,
//           gs.border_none,
//           gs.height100,
//           { borderBottomWidth: 1, borderColor: "gray" },
//         ]}
//         value={irLearnVars.source}
//         onChangeText={(v) => setIrLearnVars({ ...irLearnVars, source: v })}
//         placeholder="Source"
//         placeholderTextColor={"gray"}
//       />
//       <TextInput
//         style={[
//           gs.marginH10,
//           gs.text_orange,
//           gs.text_center,
//           gs.text_medium,
//           gs.border_none,
//           gs.height100,
//           { borderBottomWidth: 1, borderColor: "gray" },
//         ]}
//         value={irLearnVars.command}
//         onChangeText={(v) => setIrLearnVars({ ...irLearnVars, command: v })}
//         placeholder="Command"
//         placeholderTextColor={"gray"}
//       />
//       <Pressable
//         style={[
//           gs.background_green,
//           gs.border_rad5,
//           gs.flex1,
//           gs.justify_center,
//           gs.align_center,
//           gs.flex_row,
//           { padding: 1, width: "30%" },
//         ]}
//         onPress={() => {
//           console.log(`%cirLearnVars: `, f_hlt);
//           console.log(irLearnVars);
//           learnIr(irLearnVars, dispatch, setIrLearnVars);
//         }}
//       >
//         <View
//           style={[
//             gs.border_rad5,
//             gs.flex1,
//             gs.align_center,
//             gs.justify_center,
//             gs.height100,
//             {
//               borderWidth: 3,
//               flexGrow: 1,
//             },
//           ]}
//         >
//           <Text
//             style={[gs.text_medium, gs.text_bold, gs.flex_wrap, gs.text_center]}
//           >
//             Begin Receiver
//           </Text>
//         </View>
//       </Pressable>
//     </View>
//   );
// };
// const render_ir_test = (
//   {
//     cmds,
//     srcs,
//     lastCommand,
//     sel_source,
//     sel_command,
//     setSel_source,
//     setSel_command,
//     irAction,
//     setIrAction,
//     irTestCode,
//     setIrTestCode,
//     test,
//     setTest,
//   },
//   dispatch,
//   formatted_sources
// ) => {
//   return (
//     <View
//       style={[
//         gs.flex_row,
//         gs.marginH5,
//         gs.justify_between,
//         { gap: 10, height: 60, flexWrap: "wrap" },
//       ]}
//     >
//       <Pressable
//         style={[
//           gs.border_gray,
//           gs.border_rad5,
//           gs.align_center,
//           gs.justify_center,
//           { width: "15%" },
//         ]}
//         onPress={() => setIrAction("emit")}
//       >
//         <Text style={[gs.text_white, gs.text_medium]}>Emit</Text>
//       </Pressable>
//       <SelectList
//         defaultOption={() =>
//           sel_source < 0
//             ? { key: "Select Source", value: -1 }
//             : formatted_sources[sel_source]
//         }
//         setSelected={(val) => {
//           console.log(`Assigning val to setSel_source: ${val}`);
//           setSel_source(val);
//         }}
//         data={formatted_sources}
//         save="key"
//         boxStyles={[
//           gs.border_gray,
//           gs.border_rad5,
//           gs.flex1,
//           gs.paddingH10,
//           gs.align_center,
//           { paddingVertical: 2 },
//         ]}
//         inputStyles={[gs.text_gray, gs.text_medium]}
//         dropdownStyles={[]}
//         dropdownTextStyles={[gs.text_gray]}
//         arrowicon={<View style={[{ width: 0 }]} />}
//         search={false}
//       />
//       <TextInput
//         onChangeText={(v) => setIrTestCode(v)}
//         style={[
//           gs.marginH10,
//           gs.text_orange,
//           gs.text_center,
//           gs.text_medium,
//           gs.border_none,
//           gs.height100,
//           { borderBottomWidth: 1, borderColor: "gray" },
//         ]}
//         selectTextOnFocus={true}
//         onSubmitEditing={() =>
//           testIr({ source: srcs[sel_source], code: irTestCode })
//         }
//         keyboardType="numeric"
//         value={irTestCode}
//         placeholder="Code"
//         placeholderTextColor={"gray"}
//       />
//       <Pressable
//         style={[
//           gs.background_green,
//           gs.border_rad5,
//           gs.flex1,
//           gs.justify_center,
//           gs.align_center,
//           gs.flex_row,
//           { padding: 1, width: "30%" },
//         ]}
//         onPress={() => {
//           console.log({ source: srcs[sel_source], code: irTestCode });
//           testIr({ source: srcs[sel_source], code: irTestCode });
//         }}
//       >
//         <View
//           style={[
//             gs.border_rad5,
//             gs.flex1,
//             gs.align_center,
//             gs.justify_center,
//             gs.height100,
//             {
//               borderWidth: 3,
//               flexGrow: 1,
//             },
//           ]}
//         >
//           <Text
//             style={[gs.text_medium, gs.text_bold, gs.flex_wrap, gs.text_center]}
//           >
//             Test Code
//           </Text>
//         </View>
//       </Pressable>
//     </View>
//   );
// };
// const render_ardTest = ({ ir }) => {
//   const { test, setTest } = ir;

//   return (
//     <View style={[gs.paddingH5, gs.marginV20]}>
//       <Pressable
//         style={[
//           gs.flex_row,
//           gs.flex1,
//           gs.padding10,
//           gs.border_gray,
//           gs.border_rad5,
//           gs.justify_around,
//         ]}
//         onPress={() => macro()}
//       >
//         <Text style={[gs.text_white, gs.text_large]}>Run</Text>
//       </Pressable>
//     </View>
//   );
// };

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

const toggleLightsLoading = (newState, setter, animatedVal_fade) => {
  if (newState) {
    animatedVal_fade.value = 0;
    setter(true);
  } else {
    animatedVal_fade.value = 1;
    setter(false);
  }
};

const lights_toggleState = async (
  action,
  currState,
  dispatch,
  AnimatedFade_lights,
  setLoading_toggleLights
) => {
  toggleLightsLoading(true, setLoading_toggleLights, AnimatedFade_lights);

  const bus = { action, dispatch };

  if (action === "toggleLightsActive") bus.newState = !currState;
  else if (action === "setAnimation")
    bus.animationName = currState ? "defaultOnAnimation" : "defaultAnimation";

  const result = await RequestLights(bus);

  if (!result) {
    toggleLightsLoading(false, setLoading_toggleLights, AnimatedFade_lights);
    // dispatch(lights_setInitial({ updated: false }));
    return alert("Failed to reach server");
  } else {
    toggleLightsLoading(false, setLoading_toggleLights, AnimatedFade_lights);
  }
};

const lights_setAnimation = async ({
  newState,
  animName,
  dispatch,
  AnimatedFade_lights,
  setLoading_toggleLights,
}) => {
  toggleLightsLoading(true, setLoading_toggleLights, AnimatedFade_lights);

  const { success, errorMessage, lights } = await requestLights_animation({
    animationNewState: newState,
    animationName: animName,
  });

  toggleLightsLoading(false, setLoading_toggleLights, AnimatedFade_lights);

  if (!success) {
    return alert(`Failed to set animation: ${errorMessage}`);
  } else {
    const { animation_active, lights_active, animation, updated } = lights;
    console.log("dispatching ... ", {
      animation_active,
      updated,
      animation,
      lightsOn: lights_active,
    });
    dispatch(
      lights_setInitial({
        animation_active,
        updated,
        animation,
        lightsOn: lights_active,
      })
    );
  }
};

const audio_toggleZone = async ({
  zone,
  newState,
  dispatch,
  AnimatedFade_audio,
  setLoading_toggleAudio,
  setAudioZones,
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
  const { success, errorMessage, audio } = await RequestAudio({
    zoneId: zone.id,
    newState,
  });

  if (success) {
    dispatch(setZone({ zone: audio.zones.find((z) => z.id === zone.id) }));
    setAudioZones([...audio.zones]);
  } else {
    console.error(errorMessage);
  }

  toggleAudioLoading(false, setLoading_toggleAudio);
};

const updateAppData = async (dispatch) => {
  const response = await RequestServer(dispatch);
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
