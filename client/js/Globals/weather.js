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

  log && console.group("determineTempColor")
  log && console.log('values passed: ', { val, feelsObj, inside, humidity, schemeWarm })
  log && console.log('feelScale: ', feelScale)

  const feelsHot = feelScale.hot;
  const feelsCold = feelScale.cold;

  const v = Number(val);

  log && console.log('coldDay?: ', inside ? feelsObj.inside : "isWarmDay" ? "hotDay" : "coldDay")
  log && console.log('schemeWarm: ', schemeWarm)

  if (humidity) {
    // High Humidity
    if (v >= feelScale.h_high && inside)
      return '#12EBFF'
    else if (v >= feelScale.h_high && schemeWarm)
      return hot_hotColor
    else if (v >= feelScale.h_high && !schemeWarm)
      return hot_coldColor

    // Good Humidity
    if (v > feelScale.h_low && inside)
      return '#12EBFF'
    else if (v > feelScale.h_low && schemeWarm)
      return cold_coldColor
    else if (v > feelScale.h_low && !schemeWarm)
      return cold_hotColor

    // Low Humidity
    if (v <= feelScale.h_low && inside)
      return '#12EBFF'
    else if (v <= feelScale.h_low && schemeWarm)
      return orangeColor
    else if (v <= feelScale.h_low && !schemeWarm)
      return mid_coldColor

    // Out of bounds
    else {
      console.error('Number out of bounds: ', v)
      return orangeColor
    }
  }
  // if (humidity) {
  //   if (v >= feelScale.h_high)
  //     return inside
  //       ? hot_hotColor
  //       : schemeWarm
  //         ? hot_hotColor
  //         : hot_coldColor;
  //   else if (v <= feelScale.h_low)
  //     return inside ? orangeColor : schemeWarm ? orangeColor : mid_coldColor;
  //   else return inside ? schemeWarm ? cold_hotColor : cold_coldColor;
  //   // else return schemeWarm ? cold_hotColor : cold_coldColor;
  // }

  if (inside) {
    if (v >= feelScale.tooHot) return hot_hotColor;
    else if (v >= feelScale.hot) return orangeColor;
    else if (v >= feelScale.cold) return cold_hotColor;
    else if (v >= feelScale.tooCold) return cold_coldColor;
    // else if (v >= feelScale.tooCold) return mid_coldColor;
    else return cold_coldColor;
  }

  const hotColor = schemeWarm ? hot_hotColor : hot_coldColor;
  const midColor = schemeWarm ? orangeColor : mid_coldColor;
  const coldColor = schemeWarm ? cold_hotColor : cold_coldColor;

  if (v >= feelsHot) return hotColor;
  else if (v <= feelsCold) return coldColor;
  else return midColor;
};

module.exports = { determineTempColor }