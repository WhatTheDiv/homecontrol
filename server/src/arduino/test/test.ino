#include <Arduino.h>
#include <IRremote.hpp>

#define IR_SEND_TV_PIN 4

IRsend irsend_tv(IR_SEND_TV_PIN);


char request[] = "sendCommand/70\0";

void setup() {
  Serial.begin(9600);
  while (!Serial)
    ;

  Serial.println("Start.");
  Serial.println("");
  irsend_tv.enableIROut(38);
  delay(100);
}

void loop() {
  int maxNum = 300;

  for (int i = 0; i < maxNum; i++) {
    irsend_tv.sendNEC(64, i, 3);
    Serial.print("- Sending code: ( ");
    Serial.print(i);
    Serial.print(" )");
    Serial.println(i);


  }


  fin();
}


void fin() {
  delay(1000);
  exit(0);
}