// @ts-nocheck
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import LoadingIcon from "../../misc/loadingIcon";
import gs, { greenColor } from "../../../assets/styles/globalStyles";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const temps = () => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    target: 70,
    duration: 2,
  });

  // @ts-ignore
  const {
    outdoorTemp,
    outdoorTemp_high,
    outdoorTemp_low,
    outdoorTemp_tomorrow_high,
    outdoorTemp_tomorrow_low,
    indoorTemp,
  } = useSelector((state) => state.weather);

  return (
    <ScrollView style={[gs.flex1]}>
      <View style={[gs.flex1, styles.container]}>
        {/* Weather */}
        <View style={[styles.section]}>
          {/* Weather */}
          <View style={[gs.flex_row, gs.justify_between]}>
            <Text style={[gs.text_white, gs.text_large]}>Outside</Text>
            <Text style={[gs.text_white, gs.text_large]}>{outdoorTemp}°</Text>
          </View>
          {/* Forecast */}
          <View style={[gs.flex_row, gs.justify_between]}>
            <Text style={[gs.text_white, gs.text_large]}>Forecast Today</Text>
            <Text style={[gs.text_white, gs.text_large]}>
              {outdoorTemp_low}° / {outdoorTemp_high}°
            </Text>
          </View>
          <View style={[gs.flex_row, gs.justify_between]}>
            <Text style={[gs.text_white, gs.text_large]}>
              Forecast Tomorrow
            </Text>
            <Text style={[gs.text_white, gs.text_large]}>
              {outdoorTemp_tomorrow_low}° / {outdoorTemp_tomorrow_high}°
            </Text>
          </View>
        </View>

        {/* Alerts */}
        <View style={[styles.section]}>
          <Text style={[gs.text_white, gs.text_medium]}>Alerts</Text>
        </View>

        {/* Configure */}
        <View style={[styles.section]}>
          <View
            style={[gs.flex_row, gs.align_center, { marginHorizontal: 10 }]}
          >
            <Pressable
              style={[
                styles.quickButton,
                gs.border_green,
                { opacity: active ? 0.2 : 1 },
              ]}
              disabled={active}
            >
              <Text style={[gs.text_white, gs.text_large]}>DeChill</Text>
            </Pressable>
            <Pressable
              style={[
                styles.quickButton,
                gs.border_green,
                { opacity: active ? 0.2 : 1 },
              ]}
              disabled={active}
            >
              <Text style={[gs.text_white, gs.text_large]}>Quick Set</Text>
            </Pressable>
            <View style={[gs.flex1, gs.align_end]}>
              <View style={[gs.align_center]}>
                <Text style={[gs.text_white, gs.text_small]}>Inside</Text>
                <Text style={[gs.text_orange, gs.text_large]}>
                  {indoorTemp}°
                </Text>
              </View>
            </View>
          </View>
        </View>
        {loading
          ? render_loading()
          : active
          ? render_active(setActive, setLoading)
          : render_tempConfig(setActive, form, setForm, setLoading)}
      </View>
    </ScrollView>
  );
};

const render_tempConfig = (set, form, setForm, setLoading) => {
  return (
    <View style={[styles.section]}>
      <View style={[gs.align_center]}>
        <View>
          {/* Target */}
          <View
            style={[
              gs.flex_row,
              gs.align_center,
              gs.justify_between,
              styles.setting_section,
            ]}
          >
            <Text style={[gs.text_white, gs.text_large]}>Target:</Text>
            <TextInput
              style={[gs.text_green, styles.input, gs.text_center]}
              value={form.target.toString()}
              // @ts-ignore
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </View>
          {/* Duration */}
          <View
            style={[
              gs.flex_row,
              gs.align_center,
              gs.justify_between,
              styles.setting_section,
            ]}
          >
            <Text style={[gs.text_white, gs.text_large]}>
              Duration: <Text style={[gs.text_xsmall]}>[Hrs]</Text>
            </Text>
            <TextInput
              style={[gs.text_green, styles.input, gs.text_center]}
              value={form.duration.toString()}
              // @ts-ignore
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </View>
          {/* Submit */}
          <Pressable
            style={[
              styles.setTempButton,
              gs.justify_center,
              gs.align_center,
              gs.background_green,
            ]}
            onPress={() =>
              activate({ form: {}, set, newActive: true, setLoading })
            }
          >
            <Text style={[gs.text_bold, gs.text_medium]}>Set</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const render_loading = () => {
  return (
    <View style={[{ alignItems: "center", marginTop: 20 }]}>
      <LoadingIcon sqDim={100} />
    </View>
  );
};

const render_active = (set, setLoading) => {
  return (
    <View style={[gs.align_center]}>
      <View style={[{ width: "50%", maxWidth: 250 }]}>
        <Text style={[gs.text_white, gs.text_xlarge, gs.text_center]}>
          Heating Active
        </Text>
        <Pressable
          style={[
            styles.turnOffButton,
            gs.background_orange,
            gs.align_center,
            gs.flex1,
          ]}
          onPress={() =>
            activate({
              newActive: false,
              set,
              form: null,
              setLoading,
            })
          }
        >
          <Text style={[gs.text_large, gs.text_bold, gs.text_center, gs.flex1]}>
            Turn Off
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const activate = ({ form, set, newActive, setLoading }) => {
  setLoading(true);
  setTimeout(() => {
    set(newActive);
    setLoading(false);
  }, 1500);
};

export default temps;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  section: {
    marginVertical: 20,
  },
  selectionButton: {
    height: 25,
    width: 150,
    borderRadius: 5,
    marginVertical: 10,
  },
  setting_section: {
    marginVertical: 10,
  },
  setTempButton: {
    height: 50,
    borderRadius: 10,
    marginTop: 15,
  },
  turnOffButton: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    flex: 1,
    borderRadius: 10,
  },
  quickButton: {
    marginHorizontal: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "white",
    width: 75,
    marginLeft: 10,
  },
});
