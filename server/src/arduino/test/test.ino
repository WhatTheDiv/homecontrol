#include <Arduino.h>

char request[] = "sendCommand/70\0";

void setup() {
  Serial.begin(9600);
  while (!Serial)
    ;

  Serial.println("Start.");
  Serial.println("");
  delay(100);
}

void loop() {
  char something[] = "1\0";

  char one = '1';
  char two = '2';
  char three[] = "30";

  pchar(one, "one");
  pchar(two, "two");
  pchar(three, "three");
  pcarr(something, "something");
  pcarr(three, "three");

  Serial.print("atoi - 0: ");
  Serial.println(atoi('0'));
  Serial.print("atoi - 1: ");
  Serial.println(atoi('1'));
  Serial.print("atoi - 30: ");
  Serial.println(atoi(three));



  fin();
}


void pchar(char c, char name[]) {
  Serial.print("(Char) Var ");
  Serial.print(name);
  Serial.print(": <");
  Serial.print(c);
  Serial.println(">");
}
void pcarr(char c[], char name[]) {
  Serial.print("(Arr) Var ");
  Serial.print(name);
  Serial.print(": <");
  Serial.print(c);
  Serial.print("> with length: ");
  Serial.println(strlen(c));

}

void fin() {
  delay(1000);
  exit(0);
}