#include <Arduino.h>

char request[] = "sendCommand/70\0";

void setup() {
  Serial.begin(9600);
  while (!Serial)
    ;

  Serial.println("Starting script ... ");
  Serial.println("");
  delay(100);
}

void loop() {
  char nothing[] = "\0";
  Serial.print("Nothing length: ");
  Serial.println(strlen(nothing));
  // char* req = request;
// char cmd[3];

// int flag_start = -1;
// for (int i = 0; i < strlen(req); i++) {

//   if (flag_start >= 0) {
//     Serial.print("Adding ");
//     Serial.print(req[i]);
//     Serial.println(" to array");
//     cmd[flag_start] = req[i];
//     flag_start++;
//   }
//   else if (req[i] == '/') flag_start++;

// }
// cmd[flag_start] = '\0';




// Serial.print("Command: ");

// Serial.println(cmd);

// int b = int(cmd);
// int c = atoi(cmd);

// Serial.print("c: ");
// Serial.println(c);
// Serial.print("b: ");
// Serial.println(b);










  delay(1000);
  exit(0);
}