import { cold_coldColor, cold_hotColor, hot_coldColor, hot_hotColor, mid_coldColor, orangeColor } from "../../assets/styles/globalStyles";

export function determineTempColor({ val, feelsObj, inside = false, humidity = false, overrideDayFeel = false, coldDay = false, log = false }) {
  if (val !== 0 && (!val || isNaN(Number(val)))) {
    console.log(`%cnon-number passed to determine color: '${JSON.stringify(val)}'`, {
      color: "blue",
    });
    return feelsObj.isWarmDay ? orangeColor : mid_coldColor;
  }

  const schemeWarm = overrideDayFeel ? !coldDay : feelsObj.isWarmDay

  const feelScale = inside
    ? feelsObj.inside
    : schemeWarm
      ? feelsObj.hotDay
      : feelsObj.coldDay;



  const feelsHot = feelScale.hot;
  const feelsCold = feelScale.cold;

  const v = Number(val);

  log && console.log({ value: val, inside, schemeWarm, humidity, humidInside: v >= feelScale.h_high && inside, goodHumidityInside: v > feelScale.h_low && inside, dryInside: v <= feelScale.h_low && inside })

  if (humidity) {
    // High Humidity
    if (v >= feelScale.h_high && (inside || schemeWarm))
      return hot_hotColor
    else if (v >= feelScale.h_high && !inside && !schemeWarm)
      return orangeColor

    // Good Humidity
    if (v > feelScale.h_low && (inside || schemeWarm))
      return orangeColor
    else if (v > feelScale.h_low && !inside && !schemeWarm)
      return cold_hotColor

    // Low Humidity
    if (v <= feelScale.h_low && (inside || schemeWarm))
      return cold_hotColor
    else if (v <= feelScale.h_low && !inside && !schemeWarm)
      return cold_coldColor

    // Out of bounds
    else {
      console.error('Number out of bounds: ', v)
      return orangeColor
    }
  }

  if (inside) {
    if (v >= feelScale.tooHot) return hot_hotColor; // too hot
    else if (v >= feelScale.hot) return orangeColor; // hot
    else if (v > feelScale.cold && v < feelScale.hot) return cold_hotColor// warm
    else if (v <= feelScale.tooCold) return cold_coldColor; // chilly
    else if (v <= feelScale.cold) return mid_coldColor; // cold
  }

  const hotColor = schemeWarm ? hot_hotColor : orangeColor;
  const midColor = schemeWarm ? orangeColor : mid_coldColor;
  const coldColor = schemeWarm ? cold_hotColor : cold_coldColor;

  if (v >= feelsHot) return hotColor;
  else if (v <= feelsCold) return coldColor;
  else return midColor;
};

module.exports = { determineTempColor }