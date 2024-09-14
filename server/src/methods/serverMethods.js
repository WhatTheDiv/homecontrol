
export function isValidFeelValue({ newValue, feelsObj_all, feels_setting, feels_value }) {
  const status = { isValid: false, feelsValueToEdit: '', errorMessage: '' }

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
    status.feelsValueToEdit = feels_key

    if (status.feelsValueToEdit === '')
      throw new Error(`Internal error feelsValueToEdit = ''`)

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
      },
      {
        display: "Hot",
        key: "hot",
        val: feels_inside.hot,
      },
      {
        display: "Warm",
        val:
          (feels_inside.cold + 1).toString() +
          " - " +
          (feels_inside.hot - 1).toString(),
      },
      {
        display: "Cold",
        key: "cold",
        val: feels_inside.cold,
      },
      {
        display: "Chilly",
        key: "tooCold",
        val: feels_inside.tooCold,
      },
      {
        display: "Humid",
        key: "h_high",
        val: feels_inside.h_high,
      },
      {
        display: "Good Humidity",
        val:
          (feels_inside.h_low + 1).toString() +
          " - " +
          (feels_inside.h_high - 1).toString(),
      },
      {
        display: "Dry",
        key: "h_low",
        val: feels_inside.h_low,
      },
    ],
    coldDay: [
      {
        display: "Warm",
        key: "hot",
        val: feels_coldDay.hot,
      },
      {
        display: "Okay",
        val:
          (feels_coldDay.cold + 1).toString() +
          " - " +
          (feels_coldDay.hot - 1).toString(),
      },
      {
        display: "Chilly",
        key: "cold",
        val: feels_coldDay.cold,
      },
      {
        display: "Humid",
        key: "h_high",
        val: feels_coldDay.h_high,
      },
      {
        display: "Good Humidity",
        val:
          (feels_coldDay.h_low + 1).toString() +
          " - " +
          (feels_coldDay.h_high - 1).toString(),
      },
      {
        display: "Dry",
        key: "h_low",
        val: feels_coldDay.h_low,
      },
    ],
    hotDay: [
      {
        display: "Too Hot",
        key: "hot",
        val: feels_hotDay.hot,
      },
      {
        display: "Warm",
        val:
          (feels_hotDay.cold + 1).toString() +
          " - " +
          (feels_hotDay.hot - 1).toString(),
      },
      {
        display: "Cold",
        key: "cold",
        val: feels_hotDay.cold,
      },
      {
        display: "Humid",
        key: "h_high",
        val: feels_hotDay.h_high,
      },
      {
        display: "Good Humidity",
        val:
          (feels_hotDay.h_low + 1).toString() +
          " - " +
          (feels_hotDay.h_high - 1).toString(),
      },
      {
        display: "Dry",
        key: "h_low",
        val: feels_hotDay.h_low,
      },
    ],
  };
}

module.exports = { isValidFeelValue, createFeelsObj }