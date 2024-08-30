
#include <Wire.h>
#define i2c_addr 0x8



void setup() {
  Serial.begin(9600);

  Serial.println("Startup ...");
  Wire.setClock(100000);
  Wire.begin(i2c_addr);

  Wire.onRequest(MasterRequestingInput);
  Wire.onReceive(ReceivedDataFromMaster);

  delay(100);
  Serial.println("");
  Serial.println("");
  Serial.println("Beginning Test Slave ...");
  Serial.println("");
  Serial.println("");
}

void loop() {
  Serial.println("Nothing to report");
  delay(1000);
}

void MasterRequestingInput() {
  Wire.write("Something from your slave!\0");
  Serial.println("");
  Serial.println("Here you go master");
  Serial.println("");

}
void ReceivedDataFromMaster(uint8_t howMany) {
  Serial.println("");
  Serial.print("Inc from master ( ");
  Serial.print(howMany);
  Serial.print(" ) ... ");

  char str[howMany];
  unsigned int i = 0;

  while (Wire.available()) {
    str[i] = Wire.read();
    i++;

  }
  str[i] = '\0';

  if (howMany >= 1) {
    Serial.print(str);
  }

  Serial.println("");
  Serial.println("");


}

