// @ts-nocheck
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import "react-native-gesture-handler";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedRef,
  useDerivedValue,
} from "react-native-reanimated";
import React, { useState, useEffect } from "react";
import gs, { gray_a, greenColor_a } from "../../../assets/styles/globalStyles";
import LoadingIcon from "../../misc/loadingIcon";
import hslToRgb, {
  rgbToHsl,
  modified_RGBtoHSL,
  modified_HSLtoRGB,
} from "../../../js/HslToRgb";
import { runOnJS } from "react-native-reanimated";
import RequestLights from "../../../js/serverRequests/request_lights.js";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleLights_white,
  toggleLights_color,
  setRGB,
} from "../../../js/store/lights_slice";
const light_actions = {
  toggleLights_color,
  toggleLights_white,
};

const hue_max = 360;
const other_max = 100;

const log = false;
/*




// TODO 
// [ ] Add Preset buttons 
// [ ] Add ui for individually programable lights




*/

const lights = () => {
  function updateState(setState, identifier, newValue) {
    setState((oldState) => ({
      ...oldState,
      [identifier]: cleanVal,
    }));
  }
  // Set State
  // OUTPUT =  R - G - B
  // INPUT  =  H - S - L
  const dispatch = useDispatch();
  const [output, setOutput] = useState({});
  const [input, setInput] = useState({
    ...modified_RGBtoHSL({
      r: Number(useSelector((state) => state.lights.rgbColor.r)),
      g: Number(useSelector((state) => state.lights.rgbColor.g)),
      b: Number(useSelector((state) => state.lights.rgbColor.b)),
    }),
    w: 0,
    translate_h: 0,
    translate_s: 0,
    translate_l: 0,
  });

  const _lightsActive = {
    white: useSelector((state) => state.lights.whiteOn),
    color: useSelector((state) => state.lights.colorOn),
  };
  const [loading, setLoading] = useState({
    toggleLightsActive: false,
    setColor: false,
  });

  // Slider Configuration
  const { width } = useWindowDimensions();
  const sliderConfig = {
    sliderBarHeight: 2,
    thumbSize: 50,
    min: 0,
    width,
    input,
    setInput,
    updateState,
  };

  // Set Bus
  const bus = {
    dispatch,
    _lightsActive,
    loading,
    setLoading,
    output,
    setOutput,
    input,
    sliders: {
      hue: new DraggableSlider(sliderConfig, "h"),
      sat: new DraggableSlider(sliderConfig, "s"),
      light: new DraggableSlider(sliderConfig, "l"),
      white: new DraggableSlider(sliderConfig, "w"),
    },
  };

  useEffect(() => {
    log && console.log(" USEEFFECT @ handle_conversion", input);

    handle_conversion(input, output, setOutput);
  }, [input.h, input.s, input.l]);

  return (
    <View style={[gs.align_center]}>
      {render_lightToggleButtons(bus)}
      {render_sliders(bus)}
      {render_showPreview(bus)}
      {render_setColor(bus)}
    </View>
  );
};

const render_sliders = ({ input, sliders }) => {
  return (
    <View style={[styles.section, gs.width100]}>
      <View style={[gs.width100]}>
        {sliders.hue.render_slider()}
        <Text style={[gs.text_white, gs.text_center, { marginBottom: 10 }]}>
          Hue: {Math.round(input.h)}
        </Text>
      </View>
      <View style={[gs.width100]}>
        {sliders.sat.render_slider()}
        <Text style={[gs.text_white, gs.text_center, { marginBottom: 10 }]}>
          Saturation: {Math.round(input.s)}
        </Text>
      </View>
      <View style={[gs.width100]}>
        {sliders.light.render_slider()}
        <Text style={[gs.text_white, gs.text_center, { marginBottom: 10 }]}>
          Lightness: {Math.round(input.l)}
        </Text>
      </View>
      <View style={[gs.width100]}>
        {sliders.white.render_slider()}
        <Text style={[gs.text_white, gs.text_center, { marginBottom: 10 }]}>
          White: {Math.round(input.w)}
        </Text>
      </View>
    </View>
  );
};

const render_showPreview = ({ sliders, output }) => {
  return (
    <View style={[gs.width100, styles.section]}>
      <View
        style={[
          {
            backgroundColor: `rgb(${output.r},${output.g},${output.b})`,
            height: sliders.hue.thumbHeight,
            borderRadius: 5,
          },
          gs.flex_row,
          gs.justify_around,
          gs.align_center,
        ]}
      >
        <Text
          style={[
            gs.text_white,
            gs.appBackground,
            { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
          ]}
        >
          R: {output.r}
        </Text>
        <Text
          style={[
            gs.text_white,
            gs.appBackground,
            { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
          ]}
        >
          G: {output.g}
        </Text>
        <Text
          style={[
            gs.text_white,
            gs.appBackground,
            { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
          ]}
        >
          B: {output.b}
        </Text>
      </View>
    </View>
  );
};

const render_lightToggleButtons = ({
  _lightsActive,
  dispatch,
  loading,
  setLoading,
  sliders,
}) => {
  const { hue } = sliders;

  if (loading.toggleLightsActive)
    return (
      <View style={[styles.section, gs.width100, gs.align_center]}>
        <LoadingIcon sqDim={hue.thumbHeight} />
      </View>
    );
  else
    return (
      <View
        style={[styles.section, gs.flex_row, gs.width100, gs.justify_between]}
      >
        <Pressable
          onPress={() =>
            handle_toggleLightsActive(
              "all",

              setLoading,
              _lightsActive,
              dispatch
            )
          }
          style={[
            {
              height: hue.thumbHeight,
              width: hue.thumbHeight * 2,
              backgroundColor: _lightsActive.color ? greenColor_a : gray_a,
              opacity: _lightsActive.color || _lightsActive.white ? 1 : 0.4,
              borderWidth: _lightsActive.white ? 2 : 0,
              borderColor: "white",
            },
            gs.justify_center,
            gs.align_center,
            gs.border_rad10,
          ]}
        >
          <Text style={[gs.text_white, gs.text_medium]}>Lights</Text>
          <Text style={[gs.text_white, gs.text_medium]}>
            {_lightsActive.white || _lightsActive.color ? "On" : "Off"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            handle_toggleLightsActive(
              "white",
              setLoading,
              _lightsActive,
              dispatch
            )
          }
          style={[
            {
              height: hue.thumbHeight,
              width: hue.thumbHeight * 2,
              backgroundColor: _lightsActive.color ? greenColor_a : gray_a,
              opacity: _lightsActive.white ? 1 : 0.4,
            },
            gs.justify_center,
            gs.align_center,
            gs.border_rad10,
          ]}
        >
          <Text style={[gs.text_white, gs.text_medium]}>White</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            handle_toggleLightsActive(
              "color",
              setLoading,
              _lightsActive,
              dispatch
            )
          }
          style={[
            {
              height: hue.thumbHeight,
              width: hue.thumbHeight * 2,
              backgroundColor: _lightsActive.color ? greenColor_a : gray_a,
              opacity: _lightsActive.color ? 1 : 0.4,
            },
            gs.justify_center,
            gs.align_center,
            gs.border_rad10,
          ]}
        >
          <Text style={[gs.text_white, gs.text_medium]}>Color</Text>
        </Pressable>
      </View>
    );
};

const render_setColor = ({
  output,
  sliders,
  loading,
  setLoading,
  dispatch,
}) => {
  const thumbSize = sliders.hue.thumbHeight;
  const isColorDifferent = handle_registerIsColorDifferenceWithThreshold(
    output,
    0
  );

  log &&
    console.log("rendering setColor: ", {
      loading,
      isColorDifferent: isColorDifferent,
    });

  if (loading.setColor)
    return (
      <View style={[gs.width100, gs.align_center]}>
        <LoadingIcon sqDim={thumbSize} />
      </View>
    );
  else if (isColorDifferent)
    return (
      <View style={[gs.width100, gs.paddingH20]}>
        <Pressable
          onPress={() => handle_setColor(setLoading, output, dispatch)}
          style={[
            gs.justify_center,
            gs.border_rad5,
            {
              height: thumbSize,
              borderColor: `rgb(${output.r},${output.g},${output.b})`,
              borderWidth: 2,
            },
          ]}
        >
          <Text style={[gs.text_white, gs.text_large, gs.text_center]}>
            Set Color
          </Text>
        </Pressable>
      </View>
    );
  else return <View />;
};

const render_ui_loading = (state, { action, setLoading }) => {
  switch (state) {
    case "start":
      return setLoading((curr) => ({
        ...curr,
        [action]: true,
      }));
      break;
    case "reset":
      return setLoading((curr) => ({
        ...curr,
        [action]: false,
      }));
      break;
  }
};

const handle_initialConversion = (output, sliders) => {
  const { r, g, b } = output;
  const { h, s, l } = modified_RGBtoHSL(output);

  sliders.hue.setValue(Math.round(h));
  sliders.sat.setValue(Math.round(s));
  sliders.light.setValue(Math.round(l));

  // TODO sliders.hue.setSlider_initial(hue);
};

const handle_conversion = (input, output, setOutput) => {
  const doThis = () => {
    const { h, s, l } = input;
    const { r, g, b } = modified_HSLtoRGB(Number(h), Number(s), Number(l));

    // if (
    //   Math.abs(output.r - r) <= 3 ||
    //   Math.abs(output.g - g) <= 3 ||
    //   Math.abs(output.b - b) <= 3
    // )
    //   return;
    {
      log &&
        console.log(
          "@handle_conversion - setting output ",
          { r, g, b },
          " != ",
          output
        );
      setOutput({ r, g, b });
    }
  };
  runOnJS(doThis)();
};

const handle_toggleLightsActive = async (
  mode,
  setLoading,
  _lightsActive = {},
  dispatch
) => {
  const bus = {
    action: "toggleLightsActive",
    setLoading,
    mode,
    newState: mode === "all" ? false : !_lightsActive[mode],
  };

  // All lights off & pressing 'Lights off' button, exit early & do nothing
  if (mode === "all" && !_lightsActive.white && !_lightsActive.color) return;

  // Set UI to loading
  render_ui_loading("start", bus);

  // Send request
  const result = await RequestLights(bus);

  // --- Exit early on fail
  if (!result) return alert("Failed to communicate with server");

  // --- Set UI for good request
  if (mode === "all") {
    dispatch(toggleLights_color(false));
    dispatch(toggleLights_white(false));
  } else {
    dispatch(light_actions["toggleLights_" + mode](!_lightsActive[mode]));
  }

  //Finish loading
  render_ui_loading("reset", bus);
};

const handle_setColor = async (setLoading, output, dispatch) => {
  const bus = { action: "setColor", setLoading, output };

  console.log("setting ui to loading");

  // Set UI to loading
  render_ui_loading("start", { action: "setColor", setLoading });

  console.log("Sending request");

  // Send request
  const result = await RequestLights(bus);

  // Clear UI Loading
  render_ui_loading("reset", bus);

  // Send alert on fail, exit early
  if (!result) {
    alert("Failed to communicate with server");
    return;
  } else dispatch(setRGB({ r: output.r, g: output.g, b: output.b }));

  // [ ] Set UI for good request
  // [ ] Hide 'setcolor' button
};

const handle_registerIsColorDifferenceWithThreshold = (
  { r, g, b },
  threshold
) => {
  // Is there a color difference between state and selector

  const stateRGB = useSelector((state) => state.lights.rgbColor);

  if (Math.abs(stateRGB.r - r) > threshold) {
    log &&
      console.log("State and Selector color different - Red ", {
        Redux: stateRGB.r,
        State: r,
      });
    return true;
  } else if (Math.abs(stateRGB.g - g) > threshold) {
    log &&
      console.log("State and Selector color different - Green ", {
        Redux: stateRGB.g,
        State: g,
      });
    return true;
  } else if (Math.abs(stateRGB.b - b) > threshold) {
    log &&
      console.log("State and Selector color different - Blue ", {
        Redux: stateRGB.b,
        State: b,
      });
    return true;
  } else return false;

  // if (
  //   Math.abs(stateRGB.r - r) > threshold ||
  //   Math.abs(stateRGB.g - g) > threshold ||
  //   Math.abs(stateRGB.b - b) > threshold
  // )
  //   return true;
  // else return false;
};

class DraggableSlider {
  constructor(
    { sliderBarHeight, thumbSize, min, width, input, setInput, updateState },
    id
  ) {
    this.sliderBarHeight = sliderBarHeight;
    this.sliderBarRadius = sliderBarHeight * 0.5;
    this.sliderMargin = thumbSize * 1.2;
    this.thumbHeight = thumbSize;
    this.thumbWidth = thumbSize * 1.5;
    this.thumbRadius = thumbSize * 0.5;
    this.containerHeight = thumbSize * 1.2;
    const containerWidth = useSharedValue(0);
    this.containerWidth = containerWidth;
    this.containerRef = useAnimatedRef();
    this.windowWidth = width;
    this.identifier = id;
    this.maxValue = id === "h" ? hue_max : other_max;
    this.minValue = min;
    this.setValue = setInput;
    this.startingOffsetValue = input["translate_" + id];
    this.updateState = updateState;

    const thumbPressed = useSharedValue(false);
    const thumbOffset = useSharedValue(0);
    let windowWidth = width,
      thumbWidth = this.thumbWidth;
    let padLeft,
      sliderLength,
      activeSliderLength,
      startingOffsetValue,
      partLength;
    const halfThumb = thumbWidth * 0.5;

    this.thumbPressed = thumbPressed;
    this.thumbOffset = thumbOffset;
    this.thumbAnimationStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: thumbOffset.value },
        { scale: withTiming(thumbPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: thumbPressed.value ? greenColor_a : gray_a,
    }));

    this.pan = Gesture.Pan.bind(this)()
      .onBegin((event) => {
        thumbPressed.value = true;

        padLeft = event.absoluteX - event.x;
        sliderLength = windowWidth - padLeft * 2;
        activeSliderLength = sliderLength - thumbWidth;
        partLength = activeSliderLength / (this.maxValue + 1);

        if (event.x < halfThumb) {
          startingOffsetValue = halfThumb + sliderLength * -0.5;
          thumbOffset.value = startingOffsetValue;
          this.startingOffsetValue = startingOffsetValue;
        } else if (event.x > sliderLength - halfThumb) {
          startingOffsetValue = -halfThumb + sliderLength * 0.5;
          thumbOffset.value = startingOffsetValue;
          this.startingOffsetValue = startingOffsetValue;
        } else {
          startingOffsetValue = sliderLength * 0.5 + event.x - sliderLength;
          thumbOffset.value = startingOffsetValue;
          this.startingOffsetValue = startingOffsetValue;
        }

        const val = Math.floor((event.x - halfThumb) / partLength);
        const cleanVal =
          val < this.minValue ? 0 : val > this.maxValue ? this.maxValue : val;

        this.setValue((oldState) => ({
          ...oldState,
          [this.identifier]: cleanVal,
          ["translate_" + this.identifier]: startingOffsetValue,
        }));
      })
      .onChange((event) => {
        padLeft = event.absoluteX - event.x;
        sliderLength = windowWidth - padLeft * 2;
        activeSliderLength = sliderLength - thumbWidth;
        partLength = activeSliderLength / (this.maxValue + 1);

        if (event.x < halfThumb) {
          log && console.log(" thumb less than minimum ");
          thumbOffset.value = halfThumb + sliderLength * -0.5;
        } else if (event.x > sliderLength - halfThumb) {
          log && console.log(" thumb greater than maximum");
          thumbOffset.value = -halfThumb + sliderLength * 0.5;
        } else {
          log && console.log("thumb in bounds");
          thumbOffset.value = this.startingOffsetValue + event.translationX;
        }

        const val = Math.floor((event.x - halfThumb) / partLength);
        const cleanVal =
          val < this.minValue ? 0 : val > this.maxValue ? this.maxValue : val;

        // useDerivedValue(() => {
        //   runOnJS(this.updateState)(this.setValue, this.identifier, cleanVal);
        // });

        this.setValue((oldState) => ({
          ...oldState,
          [this.identifier]: cleanVal,
        }));
      })
      .onFinalize((event) => {
        thumbPressed.value = false;
        padLeft = event.absoluteX - event.x;
        sliderLength = windowWidth - padLeft * 2;
        activeSliderLength = sliderLength - thumbWidth;
        partLength = activeSliderLength / (this.maxValue + 1);

        const val = Math.floor((event.x - halfThumb) / partLength);
        const cleanVal =
          val < this.minValue ? 0 : val > this.maxValue ? this.maxValue : val;

        this.setValue((oldState) => ({
          ...oldState,
          [this.identifier]: cleanVal,
        }));
      });
  }

  render_slider() {
    return (
      <GestureHandlerRootView
        style={[
          gs.width100,
          gs.justify_center,
          { height: this.containerHeight },
        ]}
      >
        <GestureDetector gesture={this.pan}>
          <View style={[{ width: "100%", height: "100%" }, gs.justify_center]}>
            <Animated.View
              ref={this.containerRef}
              style={[
                gs.background_orange,
                gs.align_center,
                gs.justify_center,
                {
                  height: this.sliderBarHeight,
                  borderRadius: this.sliderBarRadius,
                },
              ]}
            >
              <Animated.View
                style={[
                  {
                    height: this.thumbHeight,
                    width: this.thumbWidth,
                    borderRadius: this.thumbRadius,
                  },
                  this.thumbAnimationStyle,
                ]}
              />
            </Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }
}

export default lights;

const styles = StyleSheet.create({
  tempContainer: {},
  section: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
});
