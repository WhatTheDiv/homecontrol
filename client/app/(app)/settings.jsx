// @ts-nocheck
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import gs, {
  f_hlt,
  text_medium,
  text_small,
} from "../../assets/styles/globalStyles";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setName } from "../../js/store/audio_slice";
import { change_zone_name } from "../../js/serverRequests/request_audio";
import { determineTempColor, isValidFeelValue } from "../../js/Globals/weather";
import { SelectList } from "react-native-dropdown-select-list";
import { updateFeels } from "../../js/store/weather_slice";

const settings = () => {
  const dispatch = useDispatch();

  const feelsObj = useSelector((state) => state.weather.feels);
  const feels_inside = useSelector((state) => state.weather.feels.inside);
  const feels_coldDay = useSelector((state) => state.weather.feels.coldDay);
  const feels_hotDay = useSelector((state) => state.weather.feels.hotDay);
  const feels_warmDayAt = useSelector((state) => state.weather.feels.warmDay);

  const [temp_select_setting, setTemp_select_setting] = useState(-1);
  const [temp_select_value, setTemp_select_value] = useState(-1);
  const [temp_newValue, setTemp_NewValue] = useState("");

  const temp_shownSubmitButton = useSharedValue(false);

  const items = {
    inside: [
      {
        display: "Too Hot",
        key: "tooHot",
        val: feels_inside.tooHot,
        color: determineTempColor({
          val: feels_inside.tooHot,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Hot",
        key: "hot",
        val: feels_inside.hot,
        color: determineTempColor({
          val: feels_inside.hot,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Warm",
        val:
          (feels_inside.cold + 1).toString() +
          " - " +
          (feels_inside.hot - 1).toString(),
        color: determineTempColor({
          val: feels_inside.cold + 1,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Cold",
        key: "cold",
        val: feels_inside.cold,
        color: determineTempColor({
          val: feels_inside.cold,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Chilly",
        key: "tooCold",
        val: feels_inside.tooCold,
        color: determineTempColor({
          val: feels_inside.tooCold,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Humid",
        key: "h_high",
        val: feels_inside.h_high,
        color: determineTempColor({
          val: feels_inside.h_high,
          feelsObj,
          inside: true,
          humidity: true,
        }),
      },
      {
        display: "Good Humidity",
        val:
          (feels_inside.h_low + 1).toString() +
          " - " +
          (feels_inside.h_high - 1).toString(),
        color: determineTempColor({
          val: feels_inside.h_low + 1,
          feelsObj,
          inside: true,
          humidity: true,
        }),
      },
      {
        display: "Dry",
        key: "h_low",
        val: feels_inside.h_low,
        color: determineTempColor({
          val: feels_inside.h_low,
          feelsObj,
          inside: true,
          humidity: true,
        }),
      },
    ],
    coldDay: [
      {
        display: "Warm",
        key: "hot",
        val: feels_coldDay.hot,
        color: determineTempColor({
          val: feels_coldDay.hot,
          feelsObj,
          overrideDayFeel: true,
          coldDay: true,
        }),
      },
      {
        display: "Okay",
        val:
          (feels_coldDay.cold + 1).toString() +
          " - " +
          (feels_coldDay.hot - 1).toString(),
        color: determineTempColor({
          val: feels_coldDay.cold + 1,
          feelsObj,
          overrideDayFeel: true,
          coldDay: true,
        }),
      },
      {
        display: "Chilly",
        key: "cold",
        val: feels_coldDay.cold,
        color: determineTempColor({
          val: feels_coldDay.cold,
          feelsObj,
          overrideDayFeel: true,
          coldDay: true,
        }),
      },
      {
        display: "Humid",
        key: "h_high",
        val: feels_coldDay.h_high,
        color: determineTempColor({
          val: feels_coldDay.h_high,
          feelsObj,
          humidity: true,
          overrideDayFeel: true,
          coldDay: true,
        }),
      },
      {
        display: "Good Humidity",
        val:
          (feels_coldDay.h_low + 1).toString() +
          " - " +
          (feels_coldDay.h_high - 1).toString(),
        color: determineTempColor({
          val: feels_coldDay.h_low + 1,
          feelsObj,
          humidity: true,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Dry",
        key: "h_low",
        val: feels_coldDay.h_low,
        color: determineTempColor({
          val: feels_coldDay.h_low,
          feelsObj,
          humidity: true,
          overrideDayFeel: true,
          coldDay: true,
        }),
      },
    ],
    hotDay: [
      {
        display: "Too Hot",
        key: "hot",
        val: feels_hotDay.hot,
        color: determineTempColor({
          val: feels_hotDay.hot,
          feelsObj,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Warm",
        val:
          (feels_hotDay.cold + 1).toString() +
          " - " +
          (feels_hotDay.hot - 1).toString(),
        color: determineTempColor({
          val: feels_hotDay.cold + 1,
          feelsObj,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Cold",
        key: "cold",
        val: feels_hotDay.cold,
        color: determineTempColor({
          val: feels_hotDay.cold,
          feelsObj,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Humid",
        key: "h_high",
        val: feels_hotDay.h_high,
        color: determineTempColor({
          val: feels_hotDay.h_high,
          feelsObj,
          humidity: true,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Good Humidity",
        val:
          (feels_hotDay.h_low + 1).toString() +
          " - " +
          (feels_hotDay.h_high - 1).toString(),
        color: determineTempColor({
          val: feels_hotDay.h_low + 1,
          feelsObj,
          humidity: true,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Dry",
        key: "h_low",
        val: feels_hotDay.h_low,
        color: determineTempColor({
          val: feels_hotDay.h_low,
          feelsObj,
          humidity: true,
          overrideDayFeel: true,
        }),
      },
    ],
  };

  const bus = {
    dispatch,
    tempSettings: {
      feelsObj,
      items,
      feels_inside,
      feels_coldDay,
      feels_hotDay,
      feels_warmDayAt,
      temp_select_setting,
      setTemp_select_setting,
      temp_select_value,
      setTemp_select_value,
      temp_newValue,
      setTemp_NewValue,
      temp_shownSubmitButton,
    },
  };

  useEffect(() => {
    if (temp_select_setting !== -1 && temp_select_value !== -1) {
      if (
        Number(temp_newValue) !==
        Number(
          items[temp_select_setting].find(
            (item) => item.display === temp_select_value
          ).val
        )
      )
        temp_shownSubmitButton.value = true;
      else temp_shownSubmitButton.value = false;
    }
  }, [temp_newValue]);

  return (
    <View
      style={[
        gs.appBackground,
        gs.flex1,
        gs.align_center,
        { borderTopWidth: 1, borderTopColor: "gray", paddingTop: 20 },
      ]}
    >
      {/* Temperature Settings */}
      {render_tempSettings(bus)}
    </View>
  );
};

const render_tempSettings = ({ tempSettings, dispatch }) => {
  const {
    feels_inside,
    feels_coldDay,
    feels_hotDay,
    feels_warmDayAt,
    feelsObj,
    temp_select_setting,
    setTemp_select_setting,
    temp_select_value,
    setTemp_select_value,
    temp_newValue,
    setTemp_NewValue,
    temp_shownSubmitButton,
    items,
  } = tempSettings;

  const ls = styles.tempSettings;
  const selectRowHeight = 40;
  const temp_shownSubmitButton_style = useAnimatedStyle(() => ({
    opacity: temp_shownSubmitButton.value
      ? withTiming(1, { duration: 250 })
      : withTiming(0, { duration: 250 }),
    height: temp_shownSubmitButton.value
      ? withTiming(selectRowHeight, { duration: 250 })
      : withTiming(0, { duration: 250 }),
  }));

  const select_settingList = {
    data: [
      { value: "Select a setting", key: -1 },
      ...Object.keys(items).map((item) => {
        const split = item.split("");
        const indexOfUppercase = split.findIndex(
          (letter) => letter.toUpperCase() === letter
        );
        indexOfUppercase >= 0 && split.splice(indexOfUppercase, 0, " ");
        split[0] = split[0].toUpperCase();
        const join = split.join("");

        return {
          key: item,
          value: join,
        };
      }),
    ],
    selected: temp_select_setting,
  };

  const select_valueList_data =
    temp_select_setting === -1
      ? [{ value: "Select a value", key: -1 }]
      : [
          { value: "Select a value", key: -1 },
          ...items[temp_select_setting]
            .filter(
              (value, index) =>
                !(
                  value.display === "Warm" && temp_select_setting !== "coldDay"
                ) &&
                value.display !== "Okay" &&
                value.display !== "Good Humidity"
            )
            .map((value) => ({
              key: value.display,
              value: value.display,
            })),
        ];

  return (
    <View style={[styles.section]}>
      <Text style={[ls.header]}>Temp settings</Text>
      {/* Defaults */}
      <View style={[gs.flex_row, gs.width100, { marginBottom: 20 }]}>
        {/* Inside Preferences  */}
        <View style={[gs.flex1]}>
          <Text style={[ls.title]}>Inside</Text>
          <View style={[ls.sectionContainer]}>
            {items.inside.map((item, index) => (
              <View style={[ls.itemContainer]} key={index}>
                <Text style={[ls.item]}>{item.display}</Text>
                <Text style={[ls.item, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[ls.divider]} />
        {/* Hot Day Preferences */}
        <View style={[gs.flex1]}>
          <Text style={[ls.title]}>Hot Day</Text>
          <View style={[ls.sectionContainer]}>
            {items.hotDay.map((item, index) => (
              <View style={[ls.itemContainer]} key={index}>
                <Text style={[ls.item]}>{item.display}</Text>
                <Text style={[ls.item, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[ls.divider]} />
        {/* Cold Day Preferences */}
        <View style={[gs.flex1]}>
          <Text style={[ls.title]}>Cold Day</Text>
          <View style={[ls.sectionContainer]}>
            {items.coldDay.map((item, index) => (
              <View style={[ls.itemContainer]} key={index}>
                <Text style={[ls.item]}>{item.display}</Text>
                <Text style={[ls.item, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {/* Adjustments */}
      <View style={[gs.marginH5]}>
        <View style={[gs.flex_row, { gap: 10 }]}>
          <View style={[gs.flex1]}>
            <SelectList
              data={select_settingList.data}
              defaultOption={select_settingList.data.find(
                (obj) => obj.key === temp_select_setting
              )}
              setSelected={(key) => {
                setTemp_select_value(-1);
                setTemp_select_setting(key);
                setTemp_NewValue("");
              }}
              save="key"
              arrowicon={<View style={[{ width: 0 }]} />}
              search={false}
              boxStyles={[
                gs.justify_center,
                gs.border_rad5,
                { height: selectRowHeight },
              ]}
              inputStyles={{ color: "gray" }}
              dropdownStyles={{}}
              dropdownTextStyles={{ color: "gray" }}
              dropdownItemStyles={{}}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View style={[gs.flex1]}>
            <SelectList
              data={select_valueList_data}
              disable={true}
              defaultOption={select_valueList_data.find((obj) => {
                obj.key === temp_select_value;
              })}
              setSelected={(key) => {
                setTemp_select_value(key);

                setTemp_NewValue(
                  key === -1
                    ? ""
                    : items[temp_select_setting].find(
                        (prop) => prop.display === key
                      ).val
                );
              }}
              save="key"
              arrowicon={<View style={[{ width: 0 }]} />}
              search={false}
              boxStyles={[
                gs.justify_center,
                gs.border_rad5,
                { height: selectRowHeight },
              ]}
              inputStyles={{ color: "gray" }}
              dropdownStyles={{}}
              dropdownTextStyles={{ color: "gray" }}
              dropdownItemStyles={{}}
            />
          </View>
          <View
            style={[
              gs.border_gray,
              gs.border_rad5,
              gs.justify_center,
              gs.align_center,
              { width: "25%", height: selectRowHeight },
            ]}
          >
            {temp_select_value !== -1 && (
              <TextInput
                disabled={temp_select_value === -1}
                style={[
                  gs.text_orange,
                  gs.text_medium,
                  gs.text_center,
                  Platform.OS === "web" ? { outline: "none" } : {},
                ]}
                value={temp_newValue.toString()}
                placeholderTextColor={"gray"}
                onFocus={(e) => {
                  console.log("focusing ... ");
                  if (Platform.OS === "web") e.currentTarget.select();
                  else if (Platform.OS === "android")
                    e.currentTarget.setSelection(
                      0,
                      temp_newValue.toString().length
                    );
                }}
                keyboardType="numeric"
                placeholder={
                  temp_select_value !== -1 &&
                  "Curr: " +
                    items[temp_select_setting]
                      .find((prop) => prop.display === temp_select_value)
                      .val.toString()
                }
                onChangeText={(val) => {
                  if (!isNaN(val)) setTemp_NewValue(val);
                }}
              />
            )}
          </View>
        </View>
        {/* Submit button */}
        <Animated.View
          style={[
            gs.marginV10,
            temp_shownSubmitButton_style,
            { overflow: "hidden" },
          ]}
        >
          <Pressable
            style={[
              gs.background_green,
              gs.border_rad5,
              gs.justify_center,
              gs.align_center,
              { height: selectRowHeight },
            ]}
            onPress={() =>
              button_submitChange({
                newValue: temp_newValue,
                items,
                tempSetting: temp_select_setting,
                tempValue: temp_select_value,
                dispatch,
              })
            }
          >
            <Text style={[gs.text_large, gs.text_bold]}>Submit change</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const button_submitChange = ({
  newValue,
  items,
  tempSetting,
  tempValue,
  dispatch,
}) => {
  try {
    console.group(`%cSubmit change`, f_hlt);
    const { isValid, errorMessage } = isValidFeelValue({
      newValue,
      feelsObj_all: items,
      feels_setting: tempSetting,
      feels_value: tempValue,
    });

    console.log("Is valid? ", isValid);
    console.log("error: ", errorMessage);

    // if (!isValid)
    //   throw new Error(`Not a valid number (${errorMessage})`)

    // // run fetch

    // if (success) {
    //   dispatch(updateFeels({ [tempSetting]: { [tempValue]: newValue } }));
    // } else {
    //   alert(`Failed to update ${tempSetting}:${tempValue} - ${errorMessage}`);
    // }
  } catch (e) {
    console.log("just failed.");
  } finally {
    console.groupEnd();
  }
};

export default settings;

const styles = StyleSheet.create({
  section: {
    width: "100%",
    marginVertical: 20,
    // borderWidth: 1,
    // borderColor: "red",
  },
  tempSettings: {
    header: {
      color: "gray",
      fontSize: text_medium,
      textAlign: "center",
      marginBottom: 20,
    },
    title: {
      color: "gray",
      fontSize: text_small,
      textAlign: "center",
    },
    sectionContainer: {
      marginTop: 10,
      paddingHorizontal: 10,
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    item: {
      fontSize: text_small,
      color: "white",
    },
    divider: {
      backgroundColor: "gray",
      width: 1,
    },
  },
});
