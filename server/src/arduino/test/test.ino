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

  char arr[10][10] = { "spot", "walkk" };
  String response;
  char st[] = "something";

  response.concat(st + arr[0]);



  Serial.print("ex: ");
  Serial.println(response);





  // Exit 
  Serial.flush();
  exit(0);
}
