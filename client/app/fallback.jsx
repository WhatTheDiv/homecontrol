import { Pressable, StyleSheet, Text, View } from "react-native";
import gs from "../assets/styles/globalStyles";
import React from "react";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { setFailMessage } from "../js/store/ui_slice";

const loadError = () => {
  // @ts-ignore
  const dispatch = useDispatch();
  // @ts-ignore
  const failMessage = useSelector((state) => state.ui.appFailMessage.value);

  return (
    <View style={[gs.appBackground, gs.flex1, gs.justify_center]}>
      <Text style={[gs.text_orange, gs.text_center, gs.text_large]}>
        Something went wrong :'(
      </Text>
      <Text
        style={[gs.marginV20, gs.text_white, gs.text_center, gs.text_small]}
      >
        {"( " + failMessage + " )"}
      </Text>
      <Pressable
        onPress={() => {
          dispatch(setFailMessage(false));
          router.push("/");
        }}
        style={[gs.flex_row, gs.justify_center]}
      >
        <Text
          style={[
            gs.paddingV10,
            gs.paddingH20,
            gs.text_orange,
            gs.text_center,
            gs.text_large,
            gs.border_orange,
            {
              borderRadius: 10,
            },
          ]}
        >
          Reload
        </Text>
      </Pressable>
    </View>
  );
};

export default loadError;

const styles = StyleSheet.create({});
