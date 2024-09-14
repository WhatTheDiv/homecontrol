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

    else if (feelsObj_all[feels_setting] === undefined || !feelsObj_all[feels_setting] || feelsObj_all[feels_setting][feels_value] === undefined)
      throw new Error(`Cannot find temp setting`)

    const { tooHot, hot, cold, tooCold, h_high, h_low } = feelsObj_all[feels_setting]


    if (feels_setting === 'inside' && (tooHot === undefined || tooCold === undefined))
      throw new Error(`Internal Error incorrect feels object`)

    else if (feels_setting === 'inside') {
      if (feels_value === 'tooHot' && newValue <= hot)
        throw new Error(`New value (${newValue}) >= lower bounds (hot:${hot})`)
      else if (feels_value === 'tooCold' && newValue > cold)
        throw new Error(`New value (${newValue} > lower bounds (cold:${cold}))`)
      else if (feels_value === 'hot' && newValue >= tooHot)
        throw new Error(`New value (${newValue} >= upper bounds (tooHot:${tooHot}))`)
      else if (feels_value === 'cold' && newValue < tooCold)
        throw new Error(`New value (${newValue} < lower bounds (tooCold:${tooCold}))`)
    }

    else if (feels_value === 'hot' && newValue <= cold)
      throw new Error(`New value (${newValue} < lower bounds (cold:${cold}))`)
    else if (feels_value === 'cold' && (newValue >= hot))
      throw new Error(`New value (${newValue} >= upper bounds (hot:${hot}))`)
    else if (feels_value === 'h_high' && newValue <= h_low)
      throw new Error(`New value (${newValue} >= upper bounds (h_low:${h_low}))`)
    else if (feels_value === 'h_low' && newValue > h_high)
      throw new Error(`New value (${newValue} > upper bounds (h_low:${h_low}))`)

    status.isValid = true

  } catch (e) {
    status.errorMessage = `Failed isValidFeelValue: ${e.message}`
    status.isValid = false


  } finally {
    return status
  }
}

module.exports = { determineTempColor }