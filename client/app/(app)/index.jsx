import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import gs, {
  greenColor,
  text_large,
  text_medium,
} from "../../assets/styles/globalStyles";
import React, { useEffect, useState } from "react";
import Remote from "../../components/sections/tv/remote";
import Overview from "../../components/sections/overview/overview";
import Thermostat from "../../components/sections/thermostat/temps";
import Lights from "../../components/sections/lights/lights_new";
import Camera from "../../components/sections/camera/camera";
import { useSelector } from "react-redux";
import { router, Redirect } from "expo-router";

const index = () => {
  const [section, setSection] = useState("overview");
  // sections are [ overview, lights, tv, temp, camera, routine ]
  // @ts-ignore
  const loaded = useSelector((state) => state.ui.loaded.value);

  if (!loaded) return <Redirect href="/fallback" />;

  return (
    <View style={[gs.appBackground, { flex: 1 }]}>
      {/* Button Section */}
      <View style={[styles.buttonContainer]}>
        <View style={[styles.buttonset_container, gs.justify_around]}>
          <Pressable style={[gs.flex1]} onPress={() => setSection("overview")}>
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "overview" ? styles.selected : styles.unselected,
              ]}
            >
              Overview
            </Text>
          </Pressable>

          <Pressable style={[gs.flex1]} onPress={() => setSection("routine")}>
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "routine" ? styles.selected : styles.unselected,
              ]}
            >
              Routine
            </Text>
          </Pressable>
          <Pressable
            style={[gs.flex1]}
            onPress={() => router.push("/settings")}
          >
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "settings" ? styles.selected : styles.unselected,
              ]}
            >
              Settings
            </Text>
          </Pressable>
        </View>
        <View style={[styles.buttonset_container, gs.justify_around]}>
          <Pressable style={[gs.flex1]} onPress={() => setSection("lights")}>
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "lights" ? styles.selected : styles.unselected,
              ]}
            >
              Lights
            </Text>
          </Pressable>
          <Pressable style={[gs.flex1]} onPress={() => setSection("tv")}>
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "tv" ? styles.selected : styles.unselected,
              ]}
            >
              TV
            </Text>
          </Pressable>
          <Pressable style={[gs.flex1]} onPress={() => setSection("temp")}>
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "temp" ? styles.selected : styles.unselected,
              ]}
            >
              Temp
            </Text>
          </Pressable>
          <Pressable style={[gs.flex1]} onPress={() => setSection("camera")}>
            <Text
              style={[
                gs.text_bold,
                gs.text_medium,
                styles.buttonText,
                section === "camera" ? styles.selected : styles.unselected,
              ]}
            >
              Camera
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Display Section */}
      {render_display(section)}
    </View>
  );
};

const render_display = (sec) => {
  const camera = () => {
    return <View></View>;
  };
  const routine = () => {
    return <View></View>;
  };

  switch (sec) {
    case "overview":
      return <Overview />;
    case "lights":
      return <Lights />;
    case "tv":
      return <Remote />;
    case "temp":
      return <Thermostat />;
    case "camera":
      return <Camera />;
    case "routine":
      return routine();
    default:
      return <Overview />;
  }
};

export default index;

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 4,
  },
  buttonset_container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    paddingBottom: 4,
  },
  buttonText: {
    paddingVertical: 10,
    textAlign: "center",
  },
  selected: {
    backgroundColor: greenColor,
  },
  unselected: {
    backgroundColor: "gray",
  },
});
