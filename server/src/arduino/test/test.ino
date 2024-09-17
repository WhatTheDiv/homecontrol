#include <Arduino.h>


void setup() {
  Serial.begin(9600);
  while (!Serial)
    ;

  Serial.println("Start.");
  Serial.println("");
  delay(100);
}

void loop() {

  String response;

  response = "success/l";
  response.concat(0);
  response.concat('\0');

  Serial.print("ex: ");
  Serial.println(response);





  // Exit 
  Serial.flush();
  exit(0);
}
