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
  delay(500);
}

byte lookForIrSignal() {
  bool lookForIr = true;
  while (lookForIr) {
    Serial.println('looping...');
    if (IrReceiver.decode()) {
      if (IrReceiver.decodedIRData.protocol == UNKNOWN) {
        Serial.println(F("Received noise or an unknown (or not yet enabled) protocol"));
        // We have an unknown protocol here, print extended info
        IrReceiver.printIRResultRawFormatted(&Serial, true);
        IrReceiver.resume(); // Do it here, to preserve raw data for printing with printIRResultRawFormatted()  
        lookForIr = false;
        return NULL;
      }
      else {
        IrReceiver.resume(); // Early enable receiving of the next IR frame

        Serial.print("Received signal - ");
        Serial.println(IrReceiver.decodedIRData.command);

        lookForIr = false;
        return IrReceiver.decodedIRData.command;
      }
    }
  }

}


void requestInput() {
  Serial.println("Response requested ...");

  if (request == "sendCommand" && commandRequested == 00) {
    Serial.println("Sending IR command but not command given.");
    Wire.write("fail");
  }
  else if (request == "sendCommand") {
    Serial.print("Sending IR command -");
    Serial.println(commandRequested);
    IrSender.sendNEC(0x0, commandRequested, 3);
    Wire.write("success");
  }
  else if (request.compareTo("newIr")) {
    Serial.println("Looking for IR signal ... ");
    Wire.write(lookForIrSignal());
  }
  else {
    Serial.println("Arduino out of bounds in requestInput()");
    Serial.print("Request: ");
    Serial.println(request);
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

  request = str;
  Serial.print("request: ");
  Serial.println(request);

  // processInput(str, howMany);
}
// void processInput(char inp[], uint8_t howMany) {

// }
