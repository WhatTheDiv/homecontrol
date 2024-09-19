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

  char response[30];

  char* res = response;

  // char a[] = "a";
  char b[] = "else";
  int n = 15;

  sprintf(res, "success:");

  strcat(res, "a");



  Serial.print("res: [");
  Serial.print(res);
  Serial.println("]");

  for (int i = 0; i < strlen(res) + 1; i++) {
    Serial.println(i);
    if (res[i] == '\0') {
      Serial.print("Null terminator on char ");
      Serial.println(i);
    }
  }

  //1:something2:else3:15





  // Exit 
  Serial.flush();
  exit(0);
}
