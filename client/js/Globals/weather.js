import { cold_coldColor, cold_hotColor, hot_coldColor, hot_hotColor, mid_coldColor, orangeColor } from "../../assets/styles/globalStyles";

export function determineTempColor({ val, feelsObj, inside = false, humidity = false, overrideDayFeel = false, coldDay = false }) {
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

// returns { isValid, errorMessage }
export function isValidFeelValue({ newValue, feelsObj_all, feels_setting, feels_value }) {
  const status = { isValid: false, errorMessage: '' }

  try {
    if (newValue === undefined)
      throw new Error(`No value given`)

    else if (isNaN(Number(newValue)))
      throw new Error(`New value (${newValue}) is not a number`)

    else if (feels_setting === undefined || !feels_setting)
      throw new Error(`Malformed request (tempSetting:${feels_setting})`)

    else if (feelsObj_all[feels_setting] === undefined || !feelsObj_all[feels_setting])
      throw new Error(`Cannot find existing temp setting`)

    const feelsObj = feelsObj_all[feels_setting].find(item => item.display === feels_value)

    if (feelsObj === undefined)
      throw new Error(`cannot find existing temp value`)

    const feels_key = feelsObj.key

    const val = Number(newValue)

    const feelsItem = {}
    feelsObj_all[feels_setting].forEach(item => {
      if (item.key) feelsItem[item.key] = item.val
    });

    const { tooHot, hot, cold, tooCold, h_high, h_low } = feelsItem

    if (feels_setting === 'inside' && (tooHot === undefined || tooCold === undefined))
      throw new Error(`Internal Error incorrect feels object`)

    else if (feels_setting === 'inside') {
      if (feels_key === 'tooHot' && val <= hot)
        throw new Error(`New value (${val}) >= lower bounds (hot:${hot})`)
      else if (feels_key === 'tooCold' && val >= cold)
        throw new Error(`New value (${val} >= lower bounds (cold:${cold}))`)
      else if (feels_key === 'hot' && val >= tooHot)
        throw new Error(`New value (${val} >= upper bounds (tooHot:${tooHot}))`)
      else if (feels_key === 'cold' && val <= tooCold)
        throw new Error(`New value (${val} < lower bounds (tooCold:${tooCold}))`)
    }

    if (feels_key === 'hot' && val <= cold)
      throw new Error(`New value (${val} <= lower bounds (cold:${cold}))`)
    else if (feels_key === 'cold' && (val >= hot))
      throw new Error(`New value (${val} >= upper bounds (hot:${hot}))`)
    else if (feels_key === 'h_high' && val <= h_low)
      throw new Error(`New value (${val} >= upper bounds (h_low:${h_low}))`)
    else if (feels_key === 'h_low' && val > h_high)
      throw new Error(`New value (${val} > upper bounds (h_low:${h_low}))`)

    status.isValid = true

  } catch (e) {
    status.errorMessage = `Failed isValidFeelValue: ${e.message}`
    status.isValid = false


  } finally {
    return status
  }
}

export function createFeelsObj({ feelsObj }) {
  const feels_inside = feelsObj.inside
  const feels_hotDay = feelsObj.hotDay
  const feels_coldDay = feelsObj.coldDay
  return {
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
}

module.exports = { determineTempColor, isValidFeelValue, createFeelsObj }