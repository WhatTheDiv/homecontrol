
#include <Adafruit_NeoPixel.h>
#include "Lights.h"
#include <Wire.h>

#define i2c_addr 0x24
#define LED_PIN 5
#define LED_COUNT 200 // 200

Lights lights;
volatile char request[30];
char response[30];
bool newMessage = 0;

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
  if (newMessage)
    build_response();

  lights.runEffect();

}

void wire_receiveMessage(int howMany) {
  char* req = request;
  unsigned int i = 0;

  if (howMany <= 1) {
    while (Wire.available())
      Wire.read();

    return;
  }

  while (Wire.available()) {
    req[i] = Wire.read();
    if (req[i] != '\0')
      i++;
  }

  req[i] = '\0';
  newMessage = 1;
  lights.interrupt = 1;

  // Serial.print(F("-- Inc from master ["));
  Serial.println(req);
  // Serial.println(F("]"));
}

void wire_response() {
  response[strlen(response)] = '\0';
  Wire.write(response);

  Serial.print(F("\n------ Response to master ["));
  Serial.print(response);
  Serial.print(F("]\n\n"));

  sprintf(response, "");
}

void build_response() {

  char* req = request;
  char* res = response;

  newMessage = 0;




  if (strstr(request, "state")) {
    bool areLightsOn = lights.areLightsOn();
    bool isAnimationActive = lights.isAnimationActive();

    sprintf(res, "success/l%d/a%d", areLightsOn, isAnimationActive);
  }
  else if (strstr(request, "lightsToggle")) {
    char a = *((strchr(request, '/') + 1));
    bool isAnimationActive = lights.isAnimationActive();
    bool newState;

    if (a == '0')
      newState = 0;
    else
      newState = 1;

    lights.toggleLights(newState);

    sprintf(res, "success/l%d/a%d", newState, isAnimationActive);
  }
  else if (strstr(request, "animStart")) {
    char a = *((strchr(request, '#') + 1));
    bool goodParams = 0;

    if (a == 'x') {
      goodParams = 1;
      lights.setAnimation();
    }
    else if (int(a) - 48 >= 0 && int(a) - 48 <= 9) {
      goodParams = 1;
      lights.setAnimation(int(a) - 48);
    }
    else {
      sprintf(res, "fail-badAnimId[%c]", a);
    }

    if (goodParams) {
      bool areLightsOn = lights.areLightsOn();
      bool isAnimationActive = lights.isAnimationActive();

      sprintf(res, "2success/l%d/a%d", areLightsOn, isAnimationActive);
    }

  }
  else if (strstr(request, "animStop")) {
    Serial.println(F("Checkpoint animstop"));

    lights.stopAnimation();
    bool areLightsOn = lights.areLightsOn();
    bool isAnimationActive = lights.isAnimationActive();

    sprintf(res, "success/l%d/a%d", areLightsOn, isAnimationActive);
  }
  else if (strstr(request, "getStyles")) {
    char t = *((strchr(request, '/') + 1));
    sprintf(res, "success/");

    if (t == 'a') {
      strcat(res, "a:");
      for (int k = 0; k < sizeof(lights.animationStyles) / lights.charInNames; k++) {
        if (strlen(lights.animationStyles[k]) < 1)
          break;

        if (k != 0)
          strcat(res, ",");

        strcat(res, lights.animationStyles[k]);
      }
    }
    else if (t == 's') {
      strcat(res, "s:");

      for (int k = 0; k < sizeof(lights.changeStateStyles) / lights.charInNames; k++) {
        if (strlen(lights.changeStateStyles[k]) < 1)
          break;

        if (k != 0)
          strcat(res, ",");

        strcat(res, lights.changeStateStyles[k]);
      }
    }


    // success/a:spot,walk/s:instant,fade,slide

  }
  else
    sprintf(res, "fail-OOB!");

}

// animation on -> turn off lights => still fades off
