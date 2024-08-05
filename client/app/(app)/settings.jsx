// @ts-nocheck
import { StyleSheet, Text, View, TextInput } from "react-native";
import gs from "../../assets/styles/globalStyles";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setName } from "../../js/store/audio_slice";
import { change_zone_name } from "../../js/serverRequests/request_audio";

const settings = () => {
  const dispatch = useDispatch();
  const audio = useSelector((state) => state.audio);
  const [z1name, setZ1name] = useState(audio.zone_1.name);
  const [z2name, setZ2name] = useState(audio.zone_2.name);
  // TODO integrate this

  const bus = {
    audio,
    dispatch,
    z1name,
    setZ1name,
    z2name,
    setZ2name,
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
      {render_audioSettings(bus)}
    </View>
  );
};

const render_audioSettings = ({
  audio,
  dispatch,
  setZ1name,
  setZ2name,
  z2name,
  z1name,
}) => {
  return (
    <View style={[gs.width100]}>
      <Text style={[gs.text_gray, gs.text_small, gs.text_center, gs.marginV20]}>
        Audio
      </Text>
      <View style={[gs.flex_row, gs.justify_between, gs.marginV10]}>
        <Text style={[gs.text_gray, gs.text_medium, { marginRight: 10 }]}>
          Zone 1 Label:
        </Text>
        <TextInput
          style={[gs.text_white, gs.text_medium, gs.flex1, gs.text_center]}
          defaultValue={audio.zone_1.name}
          onChangeText={(text) => setZ1name(text)}
          onBlur={(e) => {
            console.log("e.target.value: ", e.nativeEvent.text);
            updateZoneName({
              zone: 1,
              original: audio.zone_1.name,
              dispatch,
              newName: z1name,
              setNewName: setZ1name,
            });
          }}
        />
      </View>
      <View style={[gs.flex_row, gs.justify_between, gs.marginV10]}>
        <Text style={[gs.text_gray, gs.text_medium, { marginRight: 10 }]}>
          Zone 2 Label:
        </Text>
        <TextInput
          style={[gs.text_white, gs.text_medium, gs.flex1, gs.text_center]}
          defaultValue={audio.zone_2.name}
          onChangeText={(text) => setZ2name(text)}
          onBlur={(e) =>
            updateZoneName({
              zone: 2,
              original: audio.zone_2.name,
              dispatch,
              newName: z2name,
              setNewName: setZ2name,
            })
          }
        />
      </View>
    </View>
  );
};

const updateZoneName = async ({
  zone,
  original,
  dispatch,
  newName,
  setNewName,
}) => {
  if (newName === original) return;
  else if (newName.length <= 0) {
    console.error("Must enter a valie name");
    return setNewName(original);
  } else if (newName.length >= 20) {
    console.error("Name too long");
    return setNewName(original);
  }

  const res = await change_zone_name({ newName, zone });

  if (!res) {
    alert("Failed to update name");
    return setNewName(original);
  } else {
    console.log("Good update");
    return dispatch(setName({ [`zone${zone}_newName`]: newName }));
  }
};

export default settings;

const styles = StyleSheet.create({
  section: {},
});
