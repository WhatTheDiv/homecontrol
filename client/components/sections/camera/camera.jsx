import { StyleSheet, Text, View } from "react-native";
import LoadingIcon from "../../misc/loadingIcon";
import gs from "../../../assets/styles/globalStyles";
import React from "react";

const camera = () => {
  return (
    <View style={[gs.width100, gs.justify_center, gs.align_center, gs.flex1]}>
      <LoadingIcon sqDim={100} />
    </View>
  );
};

export default camera;

const styles = StyleSheet.create({});
