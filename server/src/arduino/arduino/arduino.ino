#include <Adafruit_NeoPixel.h>
#include <Wire.h>

#define LED_PIN 5
#define LED_COUNT 200 // 200
#define i2c_addr 0x8
// Living room count: 90
// Kitchen count: 110

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

uint32_t color_primary = strip.Color(0, 0, 0, 50);
uint32_t color_secondary = strip.Color(0, 0, 0, 1);
uint32_t color_off = strip.Color(0, 0, 0, 0);
uint8_t col_r = 255; // actually green
uint8_t col_g = 40;  // actually red   - grr
uint8_t col_b = 0;
uint8_t col_w = 0;
bool active = true;
bool interrupt = false;
bool initial = true;
bool lightsOn = true;
String command = "";
String animation = "fade_on";
uint16_t brightness = 255;

void setup() {
  Serial.begin(9600);
  Wire.begin(i2c_addr);
  // Wire.onReceive(receiveInput);
  Wire.onRequest(requestInput);
  strip.begin();
  Serial.println("Resetting strip color ... ");
  strip.fill(color_primary, 0);
  strip.show();
  delay(1000);
  strip.fill(color_off, 0);
  strip.show();
  Serial.println("Color reset ... ");
  delay(1000);
  Serial.println(" ... ");
  Serial.println(" ");
  Serial.println(" ");
  Serial.print("-   Animation: ");
  Serial.println(animation);

  Serial.print("-   active: ");
  Serial.println(active);

  Serial.print("-   interrupt: ");
  Serial.println(interrupt);

  Serial.print("-   initial: ");
  Serial.println(initial);
  Serial.print("-   lightsOn: ");
  Serial.println(lightsOn);
  Serial.print("-   command: ");
  Serial.println(command);

  Serial.println(" ");
  Serial.println(" ");
  Serial.println(" ");
  Serial.println(" ");
  delay(100);
}

void loop() {
  Serial.print("Loop, animation: ");
  Serial.println(animation);

  if (active == false) {
    Serial.println("loop - Active: false");
    delay(3000);
  }
  //                                 ======= update these with server reference =======

  else if (animation == "walk") { //                Id: 0
    Serial.println("loop - animation: 'walk'");
    animate_walk(25, 10, 30);
  }
  else if (animation == "slide_on") { //             Id: 1
    Serial.println("loop - animation: 'slide_on'");
    animate_slideOn(0, 50);
  }
  else if (animation == "fade_on") { //              Id: 2
    Serial.println("loop - animation: 'fade_on'");
    animate_fadeOn(10);
  }
  else if (animation == "fade_off") { //             Id: 3
    Serial.println("loop - animation: 'fade_off'");
    animate_fadeOff(5);
  }
  else if (animation == "spot") { //               Id: 4
    Serial.println("loop - animation: 'spot'");
    animate_spot(0, 5, 10);
  }
  else {
    Serial.print("checkpoint4, out of bounds in loop, animation nothing '");
    Serial.print(animation);
    Serial.println("'");
    // cleanup();
    // active = false;
  }

  if (interrupt) {
    Serial.println("loop interrupt true, resetting ...");
    interrupt = false;
    Serial.print("now, interrupt: ");
    Serial.println(interrupt);
    Serial.print("now, animation: ");
    Serial.println(animation);
    Serial.print("now, active: ");
    Serial.println(active);
    Serial.println("");
  }
}

void animate_spot(uint32_t del, uint8_t halfSpotSize, uint8_t ramp_steps) {
  Serial.println("Running animation ---------------------- 'spot'");
  initial = false;
  interrupt = false;
  strip.fill(color_off, 0);
  strip.show();

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
  Serial.print("check: ");
  Serial.println(check());
  Serial.print("ramp_step_r: ");
  Serial.println(ramp_step_r);
  Serial.print("ramp_step_g: ");
  Serial.println(ramp_step_g);
  Serial.print("ramp_step_b: ");
  Serial.println(ramp_step_b);
  Serial.print("ramp_step_w: ");
  Serial.println(ramp_step_w);
  Serial.print("ramp_steps: ");
  Serial.println(ramp_steps);
  Serial.print("halfSpotSize: ");
  Serial.println(halfSpotSize);
  Serial.print("max: ");
  Serial.println(max);
  Serial.print("min: ");
  Serial.println(min);

  bool ch = true;
  while (ch) {

    long pos = random(min, max);

    Serial.print("random position: ");
    Serial.println(pos);

    //                                  ramp up

    // - at center spot, loop through ramp color up
    Serial.println("ramping up center spot");
    for (uint8_t step = 1; step <= ramp_steps; step++) {
      Serial.print("step: ");
      Serial.println(step);
      strip.setPixelColor(pos, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
      strip.show();
      delay(del);
    }

    // - loop through spot radius
    Serial.println("looping through spot radius, up");
    for (uint8_t spot_position = 1; spot_position <= halfSpotSize; spot_position++) {
      Serial.print("ring: ");
      Serial.println(spot_position);
      // - at each spot ring, loop through ramp color up
      for (uint8_t step = 1; step <= ramp_steps; step++) {
        Serial.print("ring ramp step: ");
        Serial.println(step);
        strip.setPixelColor(pos + spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
        strip.setPixelColor(pos - spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
        strip.show();
        delay(del);
      }
    }

    delay(del);

    //                                  ramp down
    // - loop through spot radius
    Serial.println("looping through spot radius, down");
    for (short int spot_position = halfSpotSize; spot_position > 0; spot_position--) {

      Serial.print("ring: ");
      Serial.println(spot_position);
      // - at each spot ring, loop through ramp color up
      for (short int step = ramp_steps; step >= 0; step--) {
        Serial.print("ring ramp step: ");
        Serial.println(step);
        strip.setPixelColor(pos + spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
        strip.setPixelColor(pos - spot_position, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
        strip.show();
        delay(del);
      }
    }

    // - at center spot, loop through ramp color down
    for (short int step = ramp_steps; step >= 0; step--) {
      strip.setPixelColor(pos, strip.Color(ramp_step_r * step, ramp_step_g * step, ramp_step_b * step, ramp_step_w * step));
      strip.show();
      delay(del);
    }
    ch = check();
  }
}
void animate_walk(uint8_t size, uint8_t edge_Remain, uint16_t del) {
  if (initial) {
    initial = false;
    strip.fill(color_secondary, 0);
    strip.show();

    for (int i = 0; i < edge_Remain; i++) {
      if (check() != true) {
        break;
      }

      strip.setPixelColor(i, color_primary);
      strip.show();
      delay(del);
    }
  }

  walk_up(del, size, edge_Remain);
  walk_down(del, size, edge_Remain);
}
void animate_slideOn(uint32_t del, uint32_t num_in_set) {
  uint32_t full = strip.Color(0, 0, 0, brightness);
  uint32_t half = strip.Color(0, 0, 0, round((brightness / 2)));
  uint32_t medium = strip.Color(0, 0, 0, 10);
  uint32_t low = strip.Color(0, 0, 0, 1);
  uint16_t position = LED_COUNT - 1;
  short int i;

  strip.fill(color_off);
  strip.show();

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
  Serial.println("Completed slide in.");
  delay(100);

  active = false;
}
void animate_fadeOff(uint32_t del) {
  uint16_t startingBrightness = brightness;

  for (float i = 1; i > 0; i = i - .01) {
    // if(i > .50 && i != .8 && i != .9 && i != .7 && i != .6){
    //   continue;
    // }

    uint32_t fadedColor = strip.Color(0, 0, 0, uint16_t(i * startingBrightness));
    strip.fill(fadedColor);
    strip.show();
    if (i > .40) {
      continue;
    }
    delay(del);
  }

  strip.fill(color_off);
  strip.show();
  Serial.println("Completed fadeout.");
  delay(100);

  active = false;
}
void animate_fadeOn(uint32_t del) {
  for (float i = .01; i < 1; i = i + .01) {
    uint16_t fractionalBrightness = uint16_t(i * brightness);
    uint32_t fadedColor = strip.Color(0, 0, 0, fractionalBrightness);
    strip.fill(fadedColor);
    strip.show();
    delay(del);
  }

  Serial.println("Completed fade in.");
  delay(100);

  active = false;
}
void walk_up(uint16_t del, uint8_t size, uint8_t edge_Remain) {
  for (int i = edge_Remain; i < size; i++) {
    if (check() != true) {
      break;
    }
    strip.setPixelColor(i, color_primary);
    strip.show();
    delay(del);
  }

  for (int i = size; i < LED_COUNT; i++) {
    if (check() != true) {
      break;
    }
    strip.setPixelColor(i - size, color_secondary);
    strip.setPixelColor(i, color_primary);
    strip.show();
    delay(del);
  }

  for (int i = size; i > edge_Remain; i--) {
    if (check() != true) {
      break;
    }
    strip.setPixelColor(LED_COUNT - i, color_secondary);
    strip.show();
    delay(del);
  }
}
void walk_down(uint16_t del, uint8_t size, uint8_t edge_Remain) {
  for (int i = LED_COUNT - edge_Remain; i >= LED_COUNT - size; i--) {
    if (check() != true) {
      break;
    }
    strip.setPixelColor(i, color_primary);
    strip.show();
    delay(del);
  }

  for (int i = LED_COUNT - size; i >= 0; i--) {
    if (check() != true) {
      break;
    }
    strip.setPixelColor(i, color_primary);
    strip.setPixelColor(i + size, color_secondary);
    strip.show();
    delay(del);
  }

  for (int i = size; i > edge_Remain; i--) {
    if (check() != true) {
      break;
    }
    strip.setPixelColor(i, color_secondary);
    strip.show();
    delay(del);
  }
}

bool check() {
  if (interrupt) {
    return false;
  }
  else {
    return true;
  }
}
void requestInput() {
  // Serial.println("Master requesting state ... ");

  // // [S:0,A:2]
  // // State = active, Animation: slide_on

  // // implement " if command == 'getState' " ... do the following

  // char message[10] = "[S:";

  // if(lightsOn == true){
  //   strcat(message,"1");
  // }
  // else if( lightsOn == false){
  //   strcat(message,"0");
  // }

  // strcat(message,",A:");

  // if(animation == "walk"){
  //   strcat(message,"0");
  // }
  // else if(animation == "slide_on"){
  //   strcat(message,"1");
  // }
  // else if(animation == "fade_on"){
  //   strcat(message,"2");
  // }
  // else if(animation == "fade_off"){
  //   strcat(message,"3");
  // }
  // else if(animation == "spot"){
  //   strcat(message,"4");
  // }
  // else {
  //   strcat(message,"-1");
  //   Serial.println("arduino out of bounds in request input");
  // }

  // strcat(message,"]");

  // Wire.write(message);
}

void receiveInput(int howMany) {
  uint16_t count = 0;
  char str[howMany];

  while (Wire.available()) {
    byte l = Wire.read();

    if (count != 0) {
      str[count - 1] = char(l);
    }

    count++;
  }
  str[howMany - 1] = '\0';

  processInput(str, howMany);
}
void processInput(char inp[], uint16_t howMany) {
  Serial.print("Input: ");
  Serial.println(inp);

  uint8_t action_index;
  char action;

  for (uint16_t i = 0; i < howMany - 1; i++) {
    if (inp[i] == '&') {
      action_index = i + 1;
      break;
    }
  }

  action = inp[action_index];

  if (action == 'a') {
    uint8_t id_index = action_index + 1;
    char id = inp[id_index];
    return set_animation(id);
  }
  // else if(action == "c"){
  //   i = inp.indexOf("(");
  //   uint8_t j = inp.indexOf("-");

  //   String colorName = inp.substring( j + 1, inp.indexOf("("));
  //   String col = inp.substring(i+1, inp.indexOf(")"));

  //   i = col.indexOf(",");
  //   uint8_t red = (col.substring(0, i)).toInt();
  //   j = i;

  //   i = col.indexOf(",",i+1);
  //   uint8_t blue = (col.substring(j+1, i)).toInt();
  //   j = i;

  //   i = col.indexOf(",", i+1);
  //   uint8_t green = (col.substring(j+1, i)).toInt();
  //   j = i;

  //   i = col.indexOf(",", i+1);
  //   uint8_t white = (col.substring(j+1, i)).toInt();
  //   j = i;

  //   Serial.println("Setting color: { r:"+String(red)+", g:"+String(green)+", b:"+String(blue)+", w:"+String(white)+" }");

  //   if(colorName == "primary"){
  //     color_primary = strip.Color(red,blue,green,white);
  //   }
  //   else if(colorName == "secondary"){
  //     color_secondary = strip.Color(red,blue,green,white);
  //   }
  //   else if(colorName == "off"){
  //     color_off = strip.Color(red,blue,green,white);
  //   }
  //   else {
  //     Serial.println("Colorname not identifiable");
  //   }

  // }
  else if (action == 's') {
    Serial.println("hitting 's'");
    command = "getState";
  }
  else {
    // Serial.print("Could not process input ");
    // Serial.println(inp);
  }
}
void set_animation(char _animationId) {
  Serial.print("Setting animation with id: ");
  Serial.println(_animationId);
  // interrupt = true;
  active = true;
  initial = true;
  delay(300);

  switch (_animationId) {
  case '0':
    Serial.println("Setting animation to 'walk'");
    animation = "walk";
    lightsOn = true;
    return true;
    break;
  case '1':
    Serial.println("Toggling lights to 'On' with slide on");
    animation = "slide_on";
    lightsOn = true;
    return true;
    break;
  case '2':
    Serial.println("Toggling lights to 'On' with fade in");
    animation = "fade_on";
    lightsOn = true;
    return true;
    break;
  case '3':
    Serial.println("Toggling lights to 'Off' with fade out");
    animation = "fade_off";
    lightsOn = false;
    return true;
    break;
  case '4':
    Serial.println("Setting animation to 'spot'");
    animation = "spot";
    lightsOn = true;
    return true;
    break;
  default:
    Serial.println("set_animation default case");
    return false;
    break;
  }
}

void cleanup() {
  Serial.println(" ");
  Serial.print("Clearing strip ... ");

  strip.fill(strip.Color(0, 0, 0, 50), 0);
  strip.show();
  delay(400);

  strip.fill(strip.Color(0, 0, 0, 0), 0);
  strip.show();

  Serial.println("Cleared.");
  Serial.println("Script ran for " + String(round(millis() / 1000)) + " Seconds.");

  delay(200);
}
