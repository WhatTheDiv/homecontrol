
#include <Wire.h>

#define WIRE Wire

#define i2c_addr 0x8


void setup() {
  WIRE.begin(i2c_addr);
  WIRE.setClock(10000);
}

void loop() {
  delay(1000);
  Serial.println("Nothing ... ");
}