import { View } from "react-native";
import Apploading from "../components/apploading";
import React, { useEffect } from "react";
import RequestServer from "../js/serverRequests/request_initial";
import gs from "../assets/styles/globalStyles";
import { useDispatch } from "react-redux";
import { router } from "expo-router";

const loading = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    handle_initialLoad(dispatch);
  }, []);

  return (
    <View style={[gs.appBackground, gs.flex1, gs.justify_center]}>
      <Apploading />
    </View>
  );
};

const handle_initialLoad = async (dispatch) => {
  if (await RequestServer(dispatch)) router.replace("(app)");
  else router.replace("/fallback");
};

export default loading;
