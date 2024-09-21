#include <Adafruit_NeoPixel.h>

struct Lights {
  Adafruit_NeoPixel strip;
  uint8_t charInNames{ 10 }; // string max length
  char animationStyles[10][10]{ "spot", "walk" };
  char changeStateStyles[10][10]{ "instant","fade","slide" };
  uint8_t selected_animation{ 0 }; // default "spot"
  uint8_t selected_changeStateStyle_on{ 1 }; // default "fade"
  uint8_t selected_changeStateStyle_off{ 1 }; // default "fade"
  uint16_t LED_COUNT{ 0 };
  bool lightsOn{ 0 };
  bool animationActive{ 0 };
  bool interrupt{ 0 };
  bool newState_lightsOn{ 0 };
  bool newState_animation{ 0 };
  uint16_t brightness{ 255 };
  uint32_t colorOff;
  uint32_t colorDimWhite;
  uint32_t colorWhite;
  uint32_t colorOrange;

  void setPixel_on(uint16_t p = 0, uint8_t b = 0, uint32_t c = 0) {
    if (b > 0)
      brightness = b;

    strip.setPixelColor(p, strip.Color(0, 0, 0, brightness));
    strip.show();
  }
  void setPixel_color(uint16_t p = 0, uint32_t c = 0, int d = 0) {
    strip.setPixelColor(p, c);
    strip.show();

    if (d > 0)
      delay(d);
  }

  void setStrip_off() {
    strip.fill(colorOff, 0);
    strip.show();
  }
  void setStrip_custom(uint16_t r, uint16_t g, uint16_t b, uint16_t w) {
    strip.fill(strip.Color(r, g, b, w), 0);
    strip.show();
  }
  void setStrip_color(uint32_t c, int d = 0) {
    strip.fill(c, 0);
    strip.show();

    if (d > 0) {
      delay(d);
    }
  }
  void setStrip_white() {
    strip.fill(colorWhite, 0);
    strip.show();
  }
  void setStrip_on(uint8_t b = 0) {
    if (b > 0)
      brightness = b;

    strip.fill(strip.Color(0, 0, 0, brightness), 0);
    strip.show();
  }

  void animate_fadeOn(uint32_t del) {

    for (float i = .01; i < 1; i = i + .01) {
      uint16_t fractionalBrightness = uint16_t(i * brightness);
      uint32_t fadedColor = strip.Color(0, 0, 0, fractionalBrightness);
      setStrip_color(fadedColor, del);
    }

    delay(100);

  }
  void animate_fadeOff(uint32_t del) {
    uint16_t startingBrightness = brightness;

    for (float i = 1; i > 0; i = i - .01) {
      // if(i > .50 && i != .8 && i != .9 && i != .7 && i != .6){
      //   continue;
      // }

      uint32_t fadedColor = strip.Color(0, 0, 0, uint16_t(i * startingBrightness));
      setStrip_color(fadedColor);
      if (i > .40) {
        continue;
      }
      delay(del);
    }

    setStrip_off();
    delay(100);
  }
  void animate_slideOn(uint32_t del, uint32_t num_in_set) {
    uint32_t full = strip.Color(0, 0, 0, brightness);
    uint32_t half = strip.Color(0, 0, 0, round((brightness / 2)));
    uint32_t medium = strip.Color(0, 0, 0, 10);
    uint32_t low = strip.Color(0, 0, 0, 1);
    uint16_t position = LED_COUNT - 1;
    short int i;

    setStrip_off();

    for (i = position; i >= position - num_in_set; i--) {
      strip.setPixelColor(i, low);
      strip.show();
      delay(del);
    }

    position -= num_in_set;

    for (i = position; i >= position - num_in_set; i--) {
      strip.setPixelColor(i, low);
      strip.setPixelColor(i + num_in_set, medium);
      strip.show();
      delay(del);
    }

    position -= num_in_set;

    for (i = position; i >= position - num_in_set; i--) {
      strip.setPixelColor(i, low);
      strip.setPixelColor(i + num_in_set, medium);
      strip.setPixelColor(i + (num_in_set * 2), half);
      strip.show();
      delay(del);
    }

    position -= num_in_set;

    for (i = position; i >= 0; i--) {
      strip.setPixelColor(i, low);
      strip.setPixelColor(i + num_in_set, medium);
      strip.setPixelColor(i + (num_in_set * 2), half);
      strip.setPixelColor(i + (num_in_set * 3), full);
      strip.show();
      delay(del);
    }

    for (i = 0; i < num_in_set; i++) {
      strip.setPixelColor(num_in_set - 1 - i, medium);
      strip.setPixelColor((num_in_set * 2) - 1 - i, half);
      strip.setPixelColor((num_in_set * 3) - 1 - i, full);
      strip.show();
      delay(del);
    }

    for (i = 0; i < num_in_set; i++) {
      strip.setPixelColor(num_in_set - 1 - i, half);
      strip.setPixelColor((num_in_set * 2) - 1 - i, full);
      strip.show();
      delay(del);
    }

    for (i = 0; i < num_in_set; i++) {
      strip.setPixelColor(num_in_set - 1 - i, full);
      strip.show();
      delay(del);
    }
    delay(100);

  }
  void animate_spot(uint32_t del, uint8_t halfSpotSize, uint8_t ramp_steps) {
    setStrip_off();

    uint8_t col_r = 255;
    uint8_t col_g = 40;
    uint8_t col_b = 0;
    uint8_t col_w = 0;

    uint8_t ramp_step_r;
    uint8_t ramp_step_g;
    uint8_t ramp_step_b;
    uint8_t ramp_step_w;
    uint16_t max = LED_COUNT - halfSpotSize;
    uint16_t min = halfSpotSize + 1;

    //                                    Set red ramp step
    if (col_r >= ramp_steps) {
      ramp_step_r = floor(col_r / ramp_steps);
    }
    else if (col_r > 0) {
      ramp_step_r = 1;
    }


    //                                    Set green ramp step
    if (col_g >= ramp_steps) {
      ramp_step_g = floor(col_g / ramp_steps);
    }
    else if (col_g > 0) {
      ramp_step_g = 1;
    }

    //                                    Set blue ramp step
    if (col_b >= ramp_steps) {
      ramp_step_b = floor(col_b / ramp_steps);
    }
    else if (col_b > 0) {
      ramp_step_b = 1;
    }

    //                                    Set white ramp step
    if (col_w >= ramp_steps) {
      ramp_step_w = floor(col_w / ramp_steps);
    }
    else if (col_w > 0) {
      ramp_step_w = 1;
    }

    while (!interrupt) {
      long pos = random(min, max);

      //                                  ramp up

      // - at center spot, loop through ramp color up
      for (uint8_t step = 1; step <= ramp_steps; step++) {
        if (interrupt)
          break;

        strip.setPixelColor(pos, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
        strip.show();
        delay(del);
      }

      // - loop through spot radius
      for (uint8_t spot_position = 1; spot_position <= halfSpotSize; spot_position++) {
        if (interrupt)
          break;

        for (uint8_t step = 1; step <= ramp_steps; step++) {
          if (interrupt)
            break;

          strip.setPixelColor(pos + spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
          strip.setPixelColor(pos - spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
          strip.show();
          delay(del);
        }
      }

      delay(del);

      //                                  ramp down

      // - loop through spot radius
      for (short int spot_position = halfSpotSize; spot_position > 0; spot_position--) {
        // - at each spot ring, loop through ramp color up
        if (interrupt)
          break;

        for (short int step = ramp_steps; step >= 0; step--) {
          if (interrupt)
            break;

          strip.setPixelColor(pos + spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
          strip.setPixelColor(pos - spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
          strip.show();
          delay(del);
        }
      }

      // - at center spot, loop through ramp color down
      for (short int step = ramp_steps; step >= 0; step--) {
        if (interrupt)
          break;

        strip.setPixelColor(pos, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
        strip.show();
        delay(del);
      }
    }
  }
  void animate_walk(uint8_t size, uint8_t edge_Remain, uint16_t del, uint32_t c_primary, uint32_t c_secondary) {
    setStrip_color(c_secondary);

    for (int i = 0; i < edge_Remain; i++) {
      if (interrupt)
        break;
      setPixel_color(i, c_primary);
      delay(del);
    }

    while (animationActive) {
      // Walk up

      for (int i = edge_Remain; i < size; i++) {
        if (interrupt)
          break;
        setPixel_color(i, c_primary);
        delay(del);
      }

      for (int i = size; i < LED_COUNT; i++) {
        if (interrupt)
          break;
        setPixel_color(i - size, c_secondary);
        setPixel_color(i, c_primary);
        delay(del);
      }

      for (int i = size; i > edge_Remain; i--) {
        if (interrupt)
          break;
        setPixel_color(LED_COUNT - i, c_secondary);
        delay(del);
      }

      // // Walk down
      for (int i = LED_COUNT - edge_Remain; i >= LED_COUNT - size; i--) {
        if (interrupt)
          break;
        setPixel_color(i, c_primary);
        delay(del);
      }

      for (int i = LED_COUNT - size; i >= 0; i--) {
        if (interrupt)
          break;
        setPixel_color(i, c_primary);
        setPixel_color(i + size, c_secondary);
        delay(del);
      }

      for (int i = size; i > edge_Remain; i--) {
        if (interrupt)
          break;
        setPixel_color(i, c_secondary);
        delay(del);
      }

    }
  }

  void turnLightsOn() {
    interrupt = 1;

    lightsOn = 1;
    animationActive = 0;

    newState_lightsOn = 1;
  }
  void turnLightsOff() {
    interrupt = 1;

    lightsOn = 0;
    animationActive = 0;

    newState_lightsOn = 1;
  }
  void setAnimation(int8_t sel = -1) {
    interrupt = 1;

    animationActive = 1;
    lightsOn = 1;

    if (sel >= 0)
      selected_animation = sel;

    newState_animation = 1;
  }
  void toggleLights(bool isNowActive) {
    if (isNowActive)
      turnLightsOn();
    else
      turnLightsOff();
  }
  void stopAnimation() {
    // Serial.println("Checkpoint animstop");

    interrupt = 1;

    animationActive = 0;

    newState_animation = 1;
  }

  void runEffect() {
    interrupt = 0;
    bool startAnim = newState_animation == 1 && animationActive == 1;
    bool stopAnim = newState_animation == 1 && animationActive == 0;
    bool turnLightsOn = newState_lightsOn == 1 && lightsOn == 1;
    bool turnLightsOff = newState_lightsOn == 1 && lightsOn == 0;
    bool noChange = newState_lightsOn == 0 && newState_animation == 0;

    newState_animation = 0;
    newState_lightsOn = 0;


    if (noChange)
      return;

    else if (startAnim) {
      // run animation
      if (strstr(animationStyles[selected_animation], "spot")) {
        animate_spot(1, 10, 20);
      }
      else if (strstr(animationStyles[selected_animation], "walk")) {
        animate_walk(15, 4, 20, colorOrange, colorDimWhite);
      }
    }
    else if (stopAnim) {
      setStrip_off();
    }
    else if (turnLightsOn) {
      // turn lights on
      if (strstr(changeStateStyles[selected_changeStateStyle_on], "instant")) {
        setStrip_on();
      }
      else if (strstr(changeStateStyles[selected_changeStateStyle_on], "fade")) {
        animate_fadeOn(5);
      }
      else if (strstr(changeStateStyles[selected_changeStateStyle_on], "slide")) {
        animate_slideOn(10, 7);
      }
    }
    else if (turnLightsOff) {
      // turn lights off
      if (strstr(changeStateStyles[selected_changeStateStyle_off], "instant")) {
        setStrip_off();
      }
      else if (strstr(changeStateStyles[selected_changeStateStyle_off], "fade")) {
        animate_fadeOff(5);
      }
      else if (strstr(changeStateStyles[selected_changeStateStyle_off], "slide")) {
        // animate_slideOff(10, 7);
      }
    }

  }

  bool areLightsOn() {
    return lightsOn;
  }
  bool isAnimationActive() {
    return animationActive;
  }
  uint8_t which_changeStateStyle_on() {
    return selected_changeStateStyle_on;
  }
  uint8_t which_changeStateStyle_off() {
    return selected_changeStateStyle_off;
  }

  void begin(uint16_t ledCount, int16_t pin, neoPixelType type) {
    strip.updateType(type);
    strip.updateLength(ledCount);
    strip.setPin(pin);
    strip.begin();
    delay(100);

    LED_COUNT = ledCount;
    colorOff = strip.Color(0, 0, 0, 0);
    colorWhite = strip.Color(0, 0, 0, brightness);
    colorDimWhite = strip.Color(0, 0, 0, 1);
    colorOrange = strip.Color(255, 40, 0, 0);

    setStrip_off();
    delay(100);
    setStrip_custom(10, 1, 0, 0);
    delay(100);
    setStrip_off();
    delay(1000);
  }
};
