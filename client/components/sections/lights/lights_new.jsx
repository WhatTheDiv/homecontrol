// @ts-nocheck
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import gs, {
  text_large,
  greenColor,
} from "../../../assets/styles/globalStyles";
import { useSelector, useDispatch } from "react-redux";
import RequestLights from "../../../js/serverRequests/request_lights";
import { SelectList } from "react-native-dropdown-select-list";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  useDerivedValue,
  withSequence,
  withRepeat,
  interpolate,
} from "react-native-reanimated";

const lights = () => {
  const {
    lightsOn,
    updated,
    animation,
    animation_active,
    defaultAnimation,
    defaultOnAnimation,
    defaultOffAnimation,
    Animations,
    ActiveAnimations,
    Zones,
  } = useSelector((state) => state.lights);

  const [defaultAnimationSelection, setDefaultAnimationSelection] = useState({
    defaultAnimation: Animations[defaultAnimation],
    defaultOnAnimation: Animations[defaultOnAnimation],
    defaultOffAnimation: Animations[defaultOffAnimation],
  });

  const animation_animationToggleShown = useSharedValue(0);
  useEffect(() => {
    if (lightsOn) animation_animationToggleShown.value = 1;
    return () => {
      animation_animationToggleShown.value = 0;
    };
  }, []);
  const animation_animationToggleTiming = 500;

  const animationStyle_animationToggle_slide = useAnimatedStyle(() => ({
    top: withTiming(
      interpolate(animation_animationToggleShown.value, [0, 1], [50, 80]),
      { duration: animation_animationToggleTiming }
    ),
  }));

  const animationStyle_animationToggle_Fade = useAnimatedStyle(() => ({
    opacity: withTiming(animation_animationToggleShown.value, {
      duration: animation_animationToggleTiming,
    }),
  }));

  const animationStyle_animationSelectors_slide = useAnimatedStyle(() => ({
    paddingTop: withTiming(
      interpolate(animation_animationToggleShown.value, [0, 1], [0, 80]),
      { duration: animation_animationToggleTiming }
    ),
  }));

  const FormattedAnimationList = Object.keys(Animations).map((key) => {
    return {
      key: Animations[key],
      value: key
        .replace("_", " ")
        .split(" ")
        .map((item) => item[0].toUpperCase() + item.substring(1))
        .join(" "),
    };
  });

  const dispatch = useDispatch();
  const bus = {
    dispatch,
    effects: {
      animation_animationToggleShown,
      animationStyle_animationToggle_slide,
      animationStyle_animationToggle_Fade,
      animationStyle_animationSelectors_slide,
    },
    lights: {
      lightsOn,
      updated,
      animation,
      animation_active,
      Animations,
      ActiveAnimations,
      FormattedAnimationList,
      Zones,
      defaultAnimation,
      defaultOnAnimation,
      defaultOffAnimation,
      defaultAnimationSelection,
      setDefaultAnimationSelection,
    },
  };

  return (
    <ScrollView style={[gs.flex1, { marginBottom: 20 }]}>
      {/* Toggle Lights & Animation Buttons */}
      {render_toggleActivateButton(bus)}

      {/* Default Animation Selector */}
      {render_dropdownAnimationSelector(bus)}
    </ScrollView>
  );
};

const render_toggleActivateButton = ({ lights, effects, dispatch }) => {
  const { lightsOn, updated } = lights;
  const {
    animation_animationToggleShown,
    animationStyle_animationToggle_slide,
    animationStyle_animationToggle_Fade,
  } = effects;

  return (
    <View style={[gs.relative, gs.marginH10, {}]}>
      <Pressable
        onPress={() =>
          press_toggleLightsActive({
            action: "toggleLightsActive",
            newState: !lightsOn,
            dispatch,
            animation_animationToggleShown,
          })
        }
        style={[
          lightsOn ? gs.border_green : gs.border_gray,
          gs.border_rad5,
          gs.paddingV10,
          gs.paddingH5,
          gs.flex_row,
          gs.appBackground,
          gs.justify_around,
          gs.relative,
          {
            borderWidth: 5,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            opacity: !updated ? 0.15 : lightsOn ? 1 : 0.6,
            zIndex: 1,
          },
        ]}
      >
        <Text style={[gs.text_gray, gs.text_center, gs.text_large]}>
          Lights
        </Text>
        <Text
          style={[
            lightsOn ? gs.text_white : gs.text_gray,
            gs.text_center,
            gs.text_large,
          ]}
        >
          -
        </Text>
        <Text
          style={[
            lightsOn ? gs.text_orange : gs.text_gray,
            gs.text_center,
            gs.text_large,
          ]}
        >
          {lightsOn ? "Active" : "Inactive"}
        </Text>
      </Pressable>

      <Animated.View
        style={[
          gs.absolute,
          gs.width100,
          // gs.marginH10,
          animationStyle_animationToggle_slide,
          animationStyle_animationToggle_Fade,
          { zIndex: lights.lightsOn ? 1 : 0 },
        ]}
      >
        <Pressable
          onPress={() =>
            press_toggleAnimation({
              action: "setAnimation",
              animationName: lights.animation_active
                ? "defaultOnAnimation"
                : "defaultAnimation",
              dispatch,
            })
          }
          disabled={lights.lightsOn ? false : true}
          style={[
            gs.border_green,
            gs.border_rad5,
            gs.paddingV10,
            gs.paddingH5,
            gs.justify_around,
            gs.flex_row,
            {
              borderWidth: 5,
              borderTopWidth: 0,
              borderBottomWidth: 0,
              // opacity: !updated ? 0.15 : lightsOn ? 1 : 0.5,
            },
          ]}
        >
          <Text style={[gs.text_gray, gs.text_center, gs.text_large]}>
            Animation
          </Text>
          <Text style={[gs.text_white, gs.text_center, gs.text_large]}>-</Text>
          <Text
            style={[
              lights.animation_active ? gs.text_orange : gs.text_gray,
              gs.text_center,
              gs.text_large,
            ]}
          >
            {lights.animation_active ? "Active" : "Inactive"}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const render_dropdownAnimationSelector = ({ lights, effects, dispatch }) => {
  const {
    FormattedAnimationList,
    Animations,
    ActiveAnimations,
    defaultAnimation,
    defaultOnAnimation,
    defaultOffAnimation,
    defaultAnimationSelection,
    setDefaultAnimationSelection,
  } = lights;
  const { animationStyle_animationSelectors_slide } = effects;

  const _OnAnimations = FormattedAnimationList.filter(
    (item) => item.value.indexOf("On") >= 0
  );
  const _OffAnimations = FormattedAnimationList.filter(
    (item) => item.value.indexOf("Off") >= 0
  );
  const _Animations = FormattedAnimationList.filter(
    (f_item) =>
      ActiveAnimations.find(
        (anim_name) => Animations[anim_name] === f_item.key
      ) !== undefined
  );
  return (
    <Animated.View
      style={[
        gs.paddingH10,
        gs.flex_row,
        gs.justify_between,
        animationStyle_animationSelectors_slide,
        {
          gap: 10,
        },
      ]}
    >
      {/*                                       Default Animation                                       */}
      <View style={[gs.flex1]}>
        <Text
          style={[
            gs.text_gray,
            gs.text_medium,
            gs.text_center,
            gs.paddingV10,
            { marginTop: 20 },
          ]}
        >
          Animation
        </Text>
        <SelectList
          setSelected={(val) =>
            setDefaultAnimationSelection({
              ...defaultAnimationSelection,
              defaultAnimation: val,
            })
          }
          onSelect={(s) => {
            change_defaultAnimation({
              action: "changeDefaultAnimation",
              newState: "defaultAnimation",
              animationKey: defaultAnimationSelection.defaultAnimation,
              dispatch,
              lights,
            });
          }}
          arrowicon={<View style={[{ width: 0 }]} />}
          data={_Animations}
          save="key"
          defaultOption={FormattedAnimationList.find(
            (item) => item.key === Animations[defaultAnimation]
          )}
          search={false}
          inputStyles={styles._inputStyles}
          boxStyles={styles._boxStyles}
          dropdownStyles={styles._dropdownStyles}
          dropdownTextStyles={styles._dropdownTextStyles}
        />
      </View>
      {/*                                       On Animation                                       */}
      <View style={[gs.flex1]}>
        <Text
          style={[
            gs.text_gray,
            gs.text_medium,
            gs.text_center,
            gs.paddingV10,
            { marginTop: 20 },
          ]}
        >
          'On' Animation
        </Text>
        <SelectList
          setSelected={(val) =>
            setDefaultAnimationSelection({
              ...defaultAnimationSelection,
              defaultOnAnimation: val,
            })
          }
          onSelect={(s) => {
            change_defaultAnimation({
              action: "changeDefaultAnimation",
              newState: "defaultOnAnimation",
              animationKey: defaultAnimationSelection.defaultOnAnimation,
              dispatch,
              lights,
            });
          }}
          arrowicon={<View style={[{ width: 0 }]} />}
          data={_OnAnimations}
          save="key"
          defaultOption={FormattedAnimationList.find(
            (item) => item.key === Animations[defaultOnAnimation]
          )}
          search={false}
          inputStyles={styles._inputStyles}
          boxStyles={styles._boxStyles}
          dropdownStyles={styles._dropdownStyles}
          dropdownTextStyles={styles._dropdownTextStyles}
        />
      </View>

      {/*                                       Off Animation                                       */}
      <View style={[gs.flex1]}>
        <Text
          style={[
            gs.text_gray,
            gs.text_medium,
            gs.text_center,
            gs.paddingV10,
            { marginTop: 20 },
          ]}
        >
          'Off' Animation
        </Text>
        <SelectList
          setSelected={(val) =>
            setDefaultAnimationSelection({
              ...defaultAnimationSelection,
              defaultOffAnimation: val,
            })
          }
          onSelect={(s) => {
            change_defaultAnimation({
              action: "changeDefaultAnimation",
              newState: "defaultOffAnimation",
              animationKey: defaultAnimationSelection.defaultOffAnimation,
              dispatch,
              lights,
            });
          }}
          arrowicon={<View style={[{ width: 0 }]} />}
          data={_OffAnimations}
          save={"key"}
          defaultOption={FormattedAnimationList.find(
            (item) => item.key === Animations[defaultOffAnimation]
          )}
          search={false}
          inputStyles={styles._inputStyles}
          boxStyles={styles._boxStyles}
          dropdownStyles={styles._dropdownStyles}
          dropdownTextStyles={styles._dropdownTextStyles}
        />
      </View>
    </Animated.View>
  );
};

const press_toggleLightsActive = async (bus) => {
  const toggleAnimation = (state, toggleVar) => {
    if (state) {
      console.log("setting togglevar to true : currently", toggleVar.value);
      toggleVar.value = 1;
    } else {
      console.log("setting togglevar to false: currently", toggleVar.value);
      toggleVar.value = 0;
    }
  };
  toggleAnimation(bus.newState, bus.animation_animationToggleShown);

  if (await RequestLights(bus)) {
    console.log("Good response @ press_toggleAnimation");
  } else toggleAnimation(!bus.newState, bus.animation_animationToggleShown);
};
const press_toggleAnimation = async (bus) => {
  console.log("toggling  animation");
  if (await RequestLights(bus)) {
    console.log("Good response @ press_toggleAnimation");
  }
};
const change_defaultAnimation = async ({
  action,
  newState,
  animationKey,
  dispatch,
  lights,
}) => {
  const {
    setDefaultAnimationSelection,
    defaultAnimationSelection,
    FormattedAnimationList,
    Animations,
  } = lights;

  try {
    // const formattedItem = FormattedAnimationList.find(
    //   (f_item) => f_item.key === animationKey
    // );

    // if (formattedItem === undefined)
    //   throw Error(
    //     `Cannot find this animation key (${animationKey}) @ change_defaultAnimation`
    //   );

    const unformattedName = Object.keys(Animations).find(
      (anim) => Animations[anim] === animationKey
    );

    if (unformattedName === lights[newState]) return;
    else if (
      await RequestLights({
        action,
        newState,
        animationName: unformattedName,
        dispatch,
      })
    )
      console.log("Good response @ change_defaultAnimation");
    else
      setDefaultAnimationSelection({
        ...defaultAnimationSelection,
        [newState]: Animations[lights[newState]],
      });
  } catch (e) {
    console.log("Error popped up in change_defaultAnimation: " + e.message);
  }
};

const styles = StyleSheet.create({
  _boxStyles: {
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  _inputStyles: {
    fontSize: text_large,
    color: "white",
  },
  _dropdownTextStyles: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: text_large,
  },
  _dropdownStyles: { backgroundColor: greenColor },
});

export default lights;
