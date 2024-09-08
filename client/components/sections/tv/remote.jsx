// @ts-nocheck
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import gs, {
  chocolate_a,
  f_err,
  gray_a,
  greenColor,
  orange_a,
  orangeColor,
} from "../../../assets/styles/globalStyles";
import React, { useState, useEffect } from "react";
import RequestTv, {
  request_updateLastTarget,
} from "../../../js/serverRequests/request_tv";
import RequestAudio, {
  changeAudioSource,
} from "../../../js/serverRequests/request_audio";
import { requestIr_emit } from "../../../js/serverRequests/request_ir";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import { useSelector, useDispatch } from "react-redux";
import { setTvState } from "../../../js/store/tv_slice";
import { setActive, setZone } from "../../../js/store/audio_slice";

const rippleColor = "green";

const remote = () => {
  const dispatch = useDispatch();

  const btnTxtSize = gs.text_medium;
  const btnTxtColor = gs.text_white;
  const drawerMaxHeight = 140;

  const irServices = useSelector((state) => state.ir.services);

  //            Video Variables
  const video_defaultSource = useSelector(
    (state) => state.tv.video.defaultSource
  );
  const video_sourceList = useSelector((state) => state.tv.video.videoSources);
  const video_lastSourceId = useSelector(
    (state) => state.tv.video.lastSource_id
  );
  const [videoControlTarget, setVideoControlTarget] = useState(
    video_defaultSource === "last"
      ? video_lastSourceId
      : video_sourceList.find((s) => s.name === video_defaultSource).id
  );
  const [tvState, _setTvState] = useState(useSelector((state) => state.tv));

  //            Audio Variables
  const audio_sourceList = useSelector((state) => state.audio.sources);
  const audio_zoneList = useSelector((state) => state.audio.zones);
  const audio_lastSourceSelected = useSelector(
    (state) => state.audio.lastSourceSelected_id
  );
  const audio_active = useSelector((state) => state.audio.active);
  const [lastAudioSwitchCommand, setLastAudioSwitchCommand] = useState(
    audio_lastSourceSelected
  );
  const audioSwitchObj =
    irServices.find((service) => service.Source === "Audio Switch").commands ||
    {};

  //            Animation - Flash-Bar-On-Click
  const statusButtonFlash = useSharedValue(false);
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

  //            Animation - Expand-Options-Section
  const optionsButtonExpanded = useSharedValue(true);
  const optionsButton_AnimationStyle = useAnimatedStyle(() => ({
    height: optionsButtonExpanded.value
      ? withTiming(drawerMaxHeight, { duration: 275 })
      : withTiming(0, { duration: 275 }),
    opacity: optionsButtonExpanded.value
      ? withTiming(1, { duration: 275 })
      : withTiming(0, { duration: 150 }),
  }));
  const optionsDisplay_AnimationStyle = useAnimatedStyle(() => ({
    opacity: optionsButtonExpanded.value
      ? withTiming(0, { duration: 150 })
      : withTiming(1, { duration: 275 }),
  }));

  //            Animation - Highlight-Selected-Target
  const sourceHighlighter_selectedId = useSharedValue(video_lastSourceId);
  //            Animation - Highlight-Selected-AudioSource
  const audioSelectionHighlighter_cmdName = useSharedValue(
    audio_sourceList.find((source) => source.id === audio_lastSourceSelected)
      .name
  );

  // useEffect(() => {
  //   console.log("videoControlTarget: ", videoControlTarget);
  //   sourceHighlighter_selectedId.value = videoControlTarget;
  //   // first
  // }, []);

  console.log(`test variables: `, {
    audioSelectionHighlighter_cmdName: audioSelectionHighlighter_cmdName.value,
    audio_lastSourceSelected,
    audio_sourceList,
  });
  const bus = {
    dispatch,
    video: {
      video_defaultSource,
      video_sourceList,
      video_lastSourceId,
      videoControlTarget,
      setVideoControlTarget,
      tvState,
      _setTvState,
    },
    audio: {
      audio_sourceList,
      audio_zoneList,
      audio_lastSourceSelected,
      audio_active,
      lastAudioSwitchCommand,
      setLastAudioSwitchCommand,
      audioSwitchObj,
    },
    animations: {
      optionsButtonExpanded,
      optionsButton_AnimationStyle,
      drawerMaxHeight,
      sourceHighlighter_selectedId,
      audioSelectionHighlighter_cmdName,
      statusButtonFlash,
    },
  };

  return (
    <ScrollView style={[gs.relative]}>
      {/*  Options Drawer  */}
      {render_options(bus)}

      <View style={[gs.flex1, gs.relative, gs.justify_center, gs.align_center]}>
        {/*  Flasher Indicator  */}
        <View style={[gs.width100, gs.paddingH10, gs.absolute, { top: 0 }]}>
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
        {/*  Drawer Button Expand / Retract */}
        <Pressable
          style={[
            gs.absolute,
            gs.border_gray,
            gs.border_rad10,
            gs.flex_row,
            gs.justify_center,
            gs.align_center,
            { width: 40, height: 40, top: 15, left: 15 },
          ]}
          onPress={() =>
            (optionsButtonExpanded.value = !optionsButtonExpanded.value)
          }
        >
          <Text style={[gs.text_xlarge, gs.text_gray, {}]}>+</Text>
        </Pressable>
        {/*  Compact Options display  */}
        {/* <Animated.View
          style={[
            gs.absolute,
            gs.align_center,
            optionsDisplay_AnimationStyle,
            { right: 5, top: 15, gap: 5 },
          ]}
        >
          <Text
            style={[
              gs.text_orange,
              gs.text_medium,
              gs.text_right,
              { marginBottom: 10 },
            ]}
          >
            {
              sourceList.find((source) => source.Id === videoControlTarget)
                .SourceName
            }
          </Text>
          <Text
            style={[
              gs.align_end,
              gs.text_gray,
              gs.text_medium,
              gs.text_right,
              {
                borderBottomColor: gray_a,
                borderBottomWidth: 1,
              },
            ]}
          >
            Active Zones
          </Text>
          {[...Object.keys(audioZoneList)]
            .filter(
              (RawAudioSourceName) => audioZoneList[RawAudioSourceName].active
            )
            .map((RawAudioSourceName, index) => (
              <Text
                style={[gs.text_gray, gs.text_medium, gs.text_right]}
                key={index}
              >
                {audioZoneList[RawAudioSourceName].name}
              </Text>
            ))}
        </Animated.View> */}
        {/* Power */}
        <View style={[gs.flex_row, styles.tv_section]}>
          {/* - - - - - - - - - - - - - - - - - - - POWER - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              {
                borderColor: indicateButtonState(bus) ? orangeColor : "gray",
              },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "Power")}
          >
            <Text style={[btnTxtSize, gs.text_white]}>Power</Text>
          </Pressable>
        </View>
        {/* Back, Home */}
        <View style={[gs.flex_row, styles.tv_section]}>
          {/* - - - - - - - - - - - - - - - - - - - HOME - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[
              styles.tv_button,
              {
                borderColor:
                  indicateButtonState(bus) &&
                  tvState.input.name?.toLowerCase().indexOf("menu") >= 0
                    ? orangeColor
                    : "gray",
              },
            ]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() =>
              pressButton(
                bus,
                passedSourceIsTarget(bus, "Living Room") ? "Home" : "Menu"
              )
            }
          >
            <Text style={[btnTxtColor]}>
              {passedSourceIsTarget(bus, "Living Room") ? "Home" : "Menu"}
            </Text>
          </Pressable>
          {/* - - - - - - - - - - - - - - - - - - - BACK - - - - - - - - - - - - - - - - - - - */}
          <Pressable
            style={[styles.tv_button]}
            android_ripple={{
              color: rippleColor,
              foreground: true,
            }}
            onPress={() => pressButton(bus, "Back")}
          >
            <Text style={[btnTxtColor]}>Back</Text>
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
              onPress={() => pressButton(bus, "Menu Left")}
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
              onPress={() => pressButton(bus, "Menu Up")}
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
              onPress={() => pressButton(bus, "Select")}
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
              onPress={() => pressButton(bus, "Menu Down")}
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
              onPress={() => pressButton(bus, "Menu Right")}
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
            onPress={() => pressButton(bus, "Volume Down")}
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
            onPress={() => pressButton(bus, "Mute")}
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
            onPress={() => pressButton(bus, "Volume Up")}
          >
            <Text style={[btnTxtSize, btnTxtColor]}>Vol. Up</Text>
          </Pressable>
        </View>
        {/* Quick Link Set for Living Room*/}
        {passedSourceIsTarget(bus, "Living Room") && (
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
        )}
        {/* Quick Link Set for Bedroom*/}
        {passedSourceIsTarget(bus, "Bedroom") && (
          <View style={[gs.flex_row, gs.align_center, styles.tv_section]}>
            {/* - - - - - - - - - - - - - - - - - - - SLEEP - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button, gs.border_gray]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "Sleep")}
            >
              <Text style={[btnTxtSize, btnTxtColor]}>Sleep</Text>
            </Pressable>
            {/* - - - - - - - - - - - - - - - - - - - EXIT - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button, gs.border_gray]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "Exit")}
            >
              <Text style={[btnTxtSize, btnTxtColor]}>Exit</Text>
            </Pressable>
            {/* - - - - - - - - - - - - - - - - - - - STOP - - - - - - - - - - - - - - - - - - - */}
            <Pressable
              style={[styles.tv_button, gs.border_gray]}
              android_ripple={{
                color: rippleColor,
                foreground: true,
              }}
              onPress={() => pressButton(bus, "Stop")}
            >
              <Text style={[btnTxtSize, btnTxtColor]}>Stop</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default remote;

const render_options = ({ animations, video, audio, dispatch }) => {
  const {
    optionsButtonExpanded,
    optionsButton_AnimationStyle,
    drawerMaxHeight,
    sourceHighlighter_selectedId,
    audioSelectionHighlighter_cmdName,
    statusButtonFlash,
  } = animations;
  const {
    video_defaultSource,
    video_sourceList,
    video_lastSourceId,
    videoControlTarget,
    setVideoControlTarget,
    tvState,
    _setTvState,
  } = video;
  const {
    audio_sourceList,
    audio_zoneList,
    audio_lastSourceSelected,
    audio_active,
    lastAudioSwitchCommand,
    setLastAudioSwitchCommand,
    audioSwitchObj,
  } = audio;

  const sourceOptionHeight = 45;
  const unselectedOpacity = 0.3;

  return (
    <Animated.View
      style={[
        optionsButton_AnimationStyle,
        gs.marginH5,
        gs.flex_row,
        { overflow: "hidden", borderBottomWidth: 1, borderBottomColor: "gray" },
      ]}
    >
      {/* Command Target */}
      <View
        style={[
          gs.flex1,
          gs.align_center,
          {
            height: drawerMaxHeight - 7,
          },
        ]}
      >
        <Text
          style={[
            gs.text_medium,
            gs.text_gray,
            gs.text_center,
            { borderBottomWidth: 1, borderBottomColor: "gray" },
          ]}
        >
          Target
        </Text>

        <View style={[gs.flex1, gs.marginV10, gs.relative]}>
          {video_sourceList.map((source, index) => {
            // ----------------------               Animation Style
            const sourceHighlighter_AnimationStyle = useAnimatedStyle(() => ({
              color:
                sourceHighlighter_selectedId.value === source.id
                  ? withTiming(orangeColor, { duration: 250 })
                  : withTiming("gray", { duration: 250 }),
              opacity:
                sourceHighlighter_selectedId.value === source.id
                  ? withTiming(1, { duration: 250 })
                  : withTiming(unselectedOpacity, { duration: 250 }),
            }));

            return (
              <View style={[gs.flex1]} key={index}>
                <Pressable
                  style={[
                    gs.paddingH30,
                    gs.justify_center,
                    { height: sourceOptionHeight },
                  ]}
                  onPress={() => {
                    console.log(source);
                    changeTarget(source, sourceHighlighter_selectedId);
                  }}
                >
                  <Animated.Text
                    style={[
                      gs.text_orange,
                      gs.text_medium,
                      gs.text_center,
                      sourceHighlighter_AnimationStyle,
                    ]}
                  >
                    {source.name}
                  </Animated.Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
      <View style={[gs.marginV10, { width: 1, backgroundColor: gray_a }]} />
      {/* Audio Source */}
      <View
        style={[
          gs.flex1,
          gs.align_center,
          {
            height: drawerMaxHeight - 7,
          },
        ]}
      >
        <Text
          style={[
            gs.text_medium,
            gs.text_gray,
            gs.text_center,
            { borderBottomWidth: 1, borderBottomColor: "gray" },
          ]}
        >
          Audio Source
        </Text>

        <View style={[gs.flex1, gs.marginV10, gs.relative]}>
          {[...Object.keys(audioSwitchObj)].map((command, index) => {
            // ----------------------               Animation Style
            const audioSelectionHighlighter_AnimationStyle = useAnimatedStyle(
              () => ({
                color:
                  audioSelectionHighlighter_cmdName.value === command
                    ? withTiming(orangeColor, { duration: 250 })
                    : withTiming("gray", { duration: 250 }),
                opacity:
                  audioSelectionHighlighter_cmdName.value === command
                    ? withTiming(1, { duration: 250 })
                    : withTiming(unselectedOpacity, { duration: 250 }),
              })
            );

            return (
              <View style={[gs.flex1]} key={index}>
                <Pressable
                  style={[
                    gs.paddingH30,
                    gs.justify_center,
                    { height: sourceOptionHeight },
                  ]}
                  onPress={() =>
                    setAudioSource({
                      sourceName: command,
                      anim: audioSelectionHighlighter_cmdName,
                    })
                  }
                >
                  <Animated.Text
                    style={[
                      gs.text_orange,
                      gs.text_medium,
                      gs.text_center,
                      audioSelectionHighlighter_AnimationStyle,
                    ]}
                  >
                    {command}
                  </Animated.Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
      <View style={[gs.marginV10, { width: 1, backgroundColor: gray_a }]} />
      {/* Zones */}
      <View
        style={[
          gs.flex1,
          gs.align_center,
          {
            height: drawerMaxHeight - 7,
          },
        ]}
      >
        <Text
          style={[
            gs.text_medium,
            gs.text_gray,
            gs.text_center,
            { borderBottomWidth: 1, borderBottomColor: "gray" },
          ]}
        >
          Zones
        </Text>

        <View style={[gs.flex1, gs.marginV10, gs.relative]}>
          {audio_zoneList.map((zone, index) => {
            const zoneActiveHighlighter = useSharedValue(zone.active);
            const ZoneActiveHighlighter_AnimationStyle = useAnimatedStyle(
              () => ({
                color: zoneActiveHighlighter.value
                  ? withTiming(orangeColor, { duration: 250 })
                  : withTiming("gray", { duration: 250 }),
                opacity: zoneActiveHighlighter.value
                  ? withTiming(1, { duration: 250 })
                  : withTiming(unselectedOpacity, { duration: 250 }),
              })
            );

            return (
              <View style={[gs.flex1]} key={index}>
                <Pressable
                  style={[
                    gs.paddingH30,
                    gs.justify_center,
                    { height: sourceOptionHeight },
                  ]}
                  onPress={() =>
                    setAudioZoneActive({
                      zoneActiveHighlighter,
                      zoneObj: zone,
                      dispatch,
                    })
                  }
                >
                  <Animated.Text
                    style={[
                      gs.text_orange,
                      gs.text_medium,
                      gs.text_center,
                      ZoneActiveHighlighter_AnimationStyle,
                    ]}
                  >
                    {zone.name}
                  </Animated.Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

const pressButton = async (bus, button) => {
  const { videoControlTarget, sourceList } = bus.source;

  if (videoControlTarget === 0)
    // Living Room Tv Id:0
    pressButton_Ip(bus, button);
  else if (videoControlTarget === 1)
    // Bedroom Tv Id:1
    pressButton_Ir(bus, button);
};

const pressButton_Ip = async (
  { statusButtonFlash, tvState, _setTvState, dispatch, source },
  button
) => {
  const response = await RequestTv(button, dispatch);

  if (!response || !response.success) return;

  const { setting, power, input } = response;

  // exit early if it is a non-ui button
  if (!setting) return;

  flashStatusButton({ statusButtonFlash });

  _setTvState((oldState) => ({
    ...oldState,
    power,
    input,
  }));
  dispatch(setTvState({ power, input }));
};
const pressButton_Ir = async (bus, button) => {
  const { success, error } = await requestIr_emit({
    source: "Tv",
    commandName: button,
  });

  if (success) flashStatusButton({ statusButtonFlash: bus.statusButtonFlash });
  else {
    alert(`Ir failed: ${error}`);
    console.log(`%cIr failed: ${error}`, f_err);
  }
};

const changeTarget = async (target, anim_selectionIndex) => {
  anim_selectionIndex.value = target.id;

  const { success, errorMessage } = await request_updateLastTarget({
    lastSourceId: target.id,
  });
  if (!success) alert(`Failed to sync with server: ${errorMessage}`);
};

const setAudioZoneActive = async ({
  zoneActiveHighlighter,
  zoneObj,
  dispatch,
}) => {
  // [x] update animation
  // [x] tell server to turn off zone

  const originalState = zoneObj.active;
  const newState = !originalState;

  zoneActiveHighlighter.value = newState;

  const { success, errorMessage, audio } = await RequestAudio({
    zoneId: zoneObj.id,
    newState,
  });

  if (!success) alert(errorMessage);
  else
    dispatch(
      setZone({
        zone: audio.zones.find((zone) => zone.id === zoneObj.id),
      })
    );

  if (success) {
  } else zoneActiveHighlighter.value = originalState;
};

const setAudioSource = async ({ sourceName, anim }) => {
  // [x] set animation values
  // [ ] send server request to push button
  // [ ] modify last request sent

  console.log(sourceName);
  const originalValue = anim.value;
  anim.value = sourceName;
  const { success, errorMessage } = await changeAudioSource({ sourceName });

  if (!success) {
    anim.value = originalValue;
    alert(errorMessage);
  }
};

const flashStatusButton = ({ statusButtonFlash }) =>
  (statusButtonFlash.value = true);

const indicateButtonState = ({ video }) => {
  const { tvState } = video;

  //                                        Return false if Living Room Tv power is off
  if (!tvState.power) return false;
  //                                        Return false if Bedroom Tv source is selected
  // else if (passedSourceIsTarget(source, "Bedroom")) return false;
  //                                        Otherwise return true
  else return true;
};

const passedSourceIsTarget = (bus, sourceName) => {
  // if (
  //   sourceList.find((source) => source.Id === videoControlTarget).SourceName ===
  //   sourceName
  // )
  //   return true;
  // else return false;
  return true;
};

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
    marginVertical: 15,
  },
});
