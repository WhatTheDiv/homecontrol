#include <Wire.h>
#include <Arduino.h>
#include <IRremote.hpp>

#define RELAY_Z1_L 18
#define RELAY_Z1_R 19
#define RELAY_Z2_L 20
#define RELAY_Z2_R 21
#define i2c_addr 0x22
#define IR_RECEIVE_PIN 2
#define IR_SEND_PIN 3

byte lastIrReceived = NULL;
String request = "";
byte commandRequested = 00;
bool lookForIr = 0;

IRrecv irrecv(IR_RECEIVE_PIN);

void setup() {
  Serial.begin(9600);
  Wire.begin(i2c_addr);
  Wire.onRequest(requestInput);
  Wire.onReceive(receiveRequest);
  while (!Serial)
    ;

  pinMode(LED_BUILTIN, OUTPUT);
  irrecv.enableIRIn();

  delay(100);
  Serial.println("");
  Serial.println("");
  Serial.println("Beginning Bedroom Slave ...");
  Serial.println("");
  Serial.println("");
}

void loop() {
  if (lookForIr) lookForIrSignal();
  delay(1000);
}

void lookForIrSignal() {

  while (lookForIr) {
    if (IrReceiver.decode()) {
      if (IrReceiver.decodedIRData.protocol == UNKNOWN) {
        Serial.println(F("Received noise or an unknown (or not yet enabled) protocol"));
        // We have an unknown protocol here, print extended info
        IrReceiver.printIRResultRawFormatted(&Serial, true);
        IrReceiver.resume(); // Do it here, to preserve raw data for printing with printIRResultRawFormatted()  
        lookForIr = 0;
      }
      else {
        IrReceiver.resume(); // Early enable receiving of the next IR frame

        Serial.print("Received signal - ");
        Serial.println(IrReceiver.decodedIRData.command);

        lastIrReceived = IrReceiver.decodedIRData.command;
        lookForIr = 0;
      }
    }
    else {
      Serial.println("Waiting for IR...");
    }
    delay(500);
  }

}


void requestInput() {
  // Serial.println("");
  // Serial.print("Response requested ... (");
  // Serial.print(request);
  // Serial.println(")");
  // Serial.flush();
  setDefaultVariables();

  if (request.equals("sendCommand") && lastIrReceived == 00) {
    // Serial.println("Sending IR command but no command given.");
    Wire.write("fail\n");
  }
  else if (request.equals("sendCommand")) {
    IrSender.sendNEC(0x0, lastIrReceived, 3);
    Wire.write(lastIrReceived);

    // IrSender.sendNEC(0x0, commandRequested, 3);
    // Wire.write(commandRequested);
  }
  else if (request.equals("newIr")) {
    lastIrReceived = 00;
    lookForIr = 1;
    Wire.write("success\n");
  }
  else if (request.equals("getIr")) {
    Wire.write(lastIrReceived);
  }
  else {
    Wire.write("OOB!\n");
  }
}

void receiveRequest(uint8_t howMany) {
  uint16_t count = 0;
  char str[howMany];

  while (Wire.available()) {
    byte l = Wire.read();

    if (count != 0) {
      str[count - 1] = char(l);
    }

    count++;
  }
  str[howMany - 1] = '\0';

  // Serial.print("HowMany: ");
  // Serial.print(howMany);
  if (howMany <= 1) return;
  request = str;
  // Serial.print(", request: ");
  // Serial.println(request);

  // processInput(str, howMany);
}
void setDefaultVariables() {
  lookForIr = 0;
}
