
#include <Adafruit_NeoPixel.h>
#include "Lights.h"
#include <Wire.h>

#define i2c_addr 0x24
#define LED_PIN 5
#define LED_COUNT 200 // 200

Lights lights;
char request[30];

void setup() {

  // ---------------------------------------------- Setup Serial
  Serial.begin(9600);

  while (!Serial)
    ;
  Serial.println("\n***************** \n\n\nSetting up ...\n\n- Serial initialized baud: 9600.");

  // ---------------------------------------------- Setup Wire
  Wire.begin(i2c_addr);
  Wire.onReceive(wire_receiveMessage);
  Wire.onRequest(wire_response);
  Serial.print("- Wire initialized at addr: ");
  Serial.print(i2c_addr);
  Serial.println(".");

  // ---------------------------------------------- Initialize lights
  lights.begin(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);
  lights.turnLightsOn();

  // ---------------------------------------------- Setup complete
  Serial.println("\nSetup Complete.\n\n\n*****************\n");
  delay(150);


}

void loop() {
  lights.runEffect();
}

void wire_receiveMessage(int howMany) {
  char* str = request;
  unsigned int i = 0;

  if (howMany <= 1) {
    while (Wire.available())
      Wire.read();
    return;
  }

  while (Wire.available()) {
    str[i] = Wire.read();
    if (str[i] != '\0')
      i++;
  }

  str[i] = '\0';



  Serial.println("");
  Serial.print("-- Inc from master ( ");
  Serial.print(howMany);
  Serial.print(" ) [");
  Serial.print(str);
  Serial.println("]");
}

void wire_response() {
  char* req = request;
  String response;

  Serial.print("request: ");
  Serial.println(req);

  if (strstr(req, "state")) {
    bool l = lights.areLightsOn();
    bool an = lights.isAnimationActive();
    response = "success/l";
    response.concat(l);
    response.concat("/a");
    response.concat(an);
    response.concat('\0');

    // Serial.print("Are lights on: ");
    // Serial.println(l);
    // Serial.print("Is animation active? : ");
    // Serial.println(an);

  }

  // if (strstr(req, "lightsOn")) {
  //   lights.turnLightsOn();
  //   response = "success\0";
  // }
  // else if (strstr(req, "lightsOff")) {
  //   lights.turnLightsOff();
  //   response = "success\0";
  // }
  // else if (strstr(req, "lightsToggle")) {
  //   char a = *((strchr(req, '/') + 1));
  //   bool newState;

  //   if (a == '0')
  //     newState = 0;
  //   else
  //     newState = 1;

  //   lights.toggleLights(newState);

  //   response = "success/l";
  //   response.concat(a);
  //   response.concat("/a");
  //   response.concat(lights.isAnimationActive());
  //   response.concat("\0");
  // }
  // else if (strstr(req, "animStart")) {
  //   char a = *((strchr(req, '#') + 1));
  //   int animId = int(a) - 48;
  //   if (animId < 0 || animId > 9) {
  //     response = "fail-badAnimId[";
  //     response.concat(a);
  //     response.concat("]\0");
  //   }
  //   else {
  //     response = "success\0";
  //     lights.setAnimation(animId);
  //   }
  // }
  // else if (strstr(req, "animStop")) {
  //   lights.cancelAnimation();
  //   response = "success\0";
  // }
  // else if (strstr(req, "state")) {
  // response = "success/l";
  // response.concat(lights.areLightsOn());
  // response.concat("/a");
  // response.concat(lights.isAnimationActive());
  // response.concat('\0');
  // }
  // else response = "fail-OOB!\0";

  // Serial.print("Response: ");
  // Serial.println(response);

  // convert string to char array
  int resLen = response.length();
  char res[resLen + 1];
  for (int i = 0; i < resLen; i++) {
    res[i] = response[i];
    // Serial.print("assigning - ");
    // Serial.print(response[i]);
    // Serial.print(" ... ");
    // Serial.println(res);
  }

  res[resLen] = '\0';

  // Serial.print("res: ");
  // Serial.println(res);

  delay(100);
  Wire.write(res);

  // delay(100);
  // Serial.println("");
  // Serial.print("------ Response to master [");
  // Serial.print(res);
  // Serial.print("]");
  // Serial.println("");
}
