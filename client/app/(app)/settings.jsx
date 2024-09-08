// @ts-nocheck
import { StyleSheet, Text, View, TextInput } from "react-native";
import gs, { text_medium, text_small } from "../../assets/styles/globalStyles";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setName } from "../../js/store/audio_slice";
import { change_zone_name } from "../../js/serverRequests/request_audio";
import { determineTempColor } from "../../js/Globals/weather";

const settings = () => {
  const dispatch = useDispatch();

  const feelsObj = useSelector((state) => state.weather.feels);
  const feels_inside = useSelector((state) => state.weather.feels.inside);
  const feels_coldDay = useSelector((state) => state.weather.feels.coldDay);
  const feels_hotDay = useSelector((state) => state.weather.feels.hotDay);
  const feels_warmDayAt = useSelector((state) => state.weather.feels.warmDay);

  // TODO integrate this

  const bus = {
    dispatch,
    feels: {
      feelsObj,
      feels_inside,
      feels_coldDay,
      feels_hotDay,
      feels_warmDayAt,
    },
  };

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

const render_tempSettings = ({ feels }) => {
  const {
    feels_inside,
    feels_coldDay,
    feels_hotDay,
    feels_warmDayAt,
    feelsObj,
  } = feels;
  const ls = styles.tempSettings;
  const items = {
    inside: [
      {
        display: "Too Hot",
        val: feels_inside.tooHot,
        color: determineTempColor({
          val: feels_inside.tooHot,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Hot",
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
        val: feels_inside.cold,
        color: determineTempColor({
          val: feels_inside.cold,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Chilly",
        val: feels_inside.tooCold,
        color: determineTempColor({
          val: feels_inside.tooCold,
          feelsObj,
          inside: true,
        }),
      },
      {
        display: "Humid",
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
        val: feels_hotDay.cold,
        color: determineTempColor({
          val: feels_hotDay.cold,
          feelsObj,
          overrideDayFeel: true,
        }),
      },
      {
        display: "Humid",
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
  console.groupEnd();
  return (
    <View style={[styles.section]}>
      <Text style={[ls.header]}>Temp settings</Text>
      {/* Defaults */}
      <View style={[gs.flex_row, gs.width100, { height: 50 }]}>
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
    </View>
  );
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
