
#include <Wire.h>
#include <Arduino.h>
#include <IRremote.hpp>

#define AUDIO_Z1_L 12
#define AUDIO_Z1_R 11
#define AUDIO_Z2_L 10
#define AUDIO_Z2_R 9
#define i2c_addr 0x8
#define IR_RECEIVE_PIN 2
#define IR_SEND_PIN 3

byte lastIrReceived = NULL;
String request = "";
byte commandRequested = 00;
bool lookForIr = 0;
bool sendIrOnce = 0;

bool audioOn = 1;
bool audioOff = 0;

IRrecv irrecv(IR_RECEIVE_PIN);
IRsend irsend(IR_SEND_PIN);


void setup() {
  Serial.begin(9600);

  Serial.write("Startup ...");
  Wire.setClock(100000);
  Wire.begin(i2c_addr);

  Wire.onRequest(requestInput);
  Wire.onReceive(receiveRequest);

  while (!Serial)
    ;

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(AUDIO_Z1_L, OUTPUT);
  pinMode(AUDIO_Z1_R, OUTPUT);
  pinMode(AUDIO_Z2_L, OUTPUT);
  pinMode(AUDIO_Z2_R, OUTPUT);

  digitalWrite(AUDIO_Z1_L, HIGH);
  digitalWrite(AUDIO_Z1_R, HIGH);
  digitalWrite(AUDIO_Z2_L, HIGH);
  digitalWrite(AUDIO_Z2_R, HIGH);

  irrecv.enableIRIn();
  irsend.enableIROut(38);

  delay(1000);
  Serial.println("");
  Serial.println("");
  Serial.println("Beginning Bedroom Slave ...");
  Serial.println("");
  Serial.println("");
}

void loop() {
  if (lookForIr) lookForIrSignal();
  if (sendIrOnce) {
    sendIrOnce = 0;
    irsend.sendNEC(0x0, lastIrReceived, 10);
  }

  delay(200);
}




void requestInput() {
  if (request.equals("sendCommand") && lastIrReceived == 00) {
    // Serial.println("Sending IR command but no command given.");
    Wire.write("fail\0");
  }
  else if (request.indexOf("sendCommand") >= 0) {
    sendIrOnce = 1;
    Wire.write("success\0");
  }
  else if (request.indexOf("newIr") >= 0) {
    lastIrReceived = 00;
    lookForIr = 1;
    Wire.write("success\0");
  }
  else if (request.indexOf("getIr") >= 0) {
    Wire.write(lastIrReceived);
  }
  else if (request.indexOf("getAudio") >= 0) {
    String s = "success/z1-";
    // strcat(s, char(digitalRead(AUDIO_Z1_L)));
    s.concat(digitalRead(AUDIO_Z1_L));
    s.concat("/z2-");
    s.concat(digitalRead(AUDIO_Z2_L));
    s.concat("\n");

    char b[s.length()];

    s.toCharArray(b, s.length() + 1);



    // strcat(s, "/z2-");
    // strcat(s, char(digitalRead(AUDIO_Z2_L)));
    // strcat(s, "\n");

    Wire.write(b);
    // z1-0/z2-0
  }
  else if (request.indexOf("setAudio") >= 0) {
    char index_zone = request.indexOf("/") + 2;
    char index_state = request.indexOf("-") + 1;

    if (index_zone == -1 || index_state == -1) Wire.write("fail-noData\n");

    char z = char(request[index_zone]);
    char s = char(request[index_state]);

    if (z == '1' && s == '0') {
      digitalWrite(AUDIO_Z1_L, audioOff);
      digitalWrite(AUDIO_Z1_R, audioOff);
    }
    else if (z == '1') {
      digitalWrite(AUDIO_Z1_L, audioOn);
      digitalWrite(AUDIO_Z1_R, audioOn);
    }
    else if (z == '2' && s == '0') {
      digitalWrite(AUDIO_Z2_L, audioOff);
      digitalWrite(AUDIO_Z2_R, audioOff);
    }
    else if (z == '2') {
      digitalWrite(AUDIO_Z2_L, audioOn);
      digitalWrite(AUDIO_Z2_R, audioOn);
    }
    else if (z != '1' && z != '2') {
      Wire.write("fail-Zrange\0");
      delay(1000);
      Serial.print("z:");
      Serial.print(z);
      Serial.print(", s:");
      Serial.println(s);

      return;
    }
    else if (s != '0' && s != '0') {
      Wire.write("fail-Srange\0");
      return;
    }
    else {
      Wire.write("fail-nogood\0");
      return;
    }

    Wire.write("success\0");

  }
  else {
    Wire.write("fail-OOB!\0");
  }
}

void receiveRequest(uint8_t howMany) {
  uint16_t count = 0;
  char str[howMany];

  while (Wire.available()) {
    byte l = Wire.read();
    // Serial.println(char(l));
    str[count] = char(l);
    count++;
  }
  str[count] = '\0';

  // Serial.print("HowMany: ");
  // Serial.print(howMany);
  Serial.print("Receive requets ( ");
  Serial.print(howMany);
  Serial.print(" )");

  if (howMany <= 1) {
    Serial.println("");
    return;
  };
  request = str;

  Serial.print(" from esp2866: ");
  Serial.println(request);
  Serial.println("");

  // processInput(str, howMany);
}
void setDefaultVariables() {
  lookForIr = 0;
}
