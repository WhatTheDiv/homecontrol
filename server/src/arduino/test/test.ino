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

  char a = '9';

  int n = int(a) - 48;

  Serial.print("N is ");
  Serial.println(n);





  // Exit 
  Serial.flush();
  exit(0);
}
