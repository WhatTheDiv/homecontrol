#include <Adafruit_NeoPixel.h>

#define LED_PIN 2
#define LED_COUNT 90

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

void setup(){
  strip.begin();
  strip.show();
}
void loop(){
  exit(0);
}