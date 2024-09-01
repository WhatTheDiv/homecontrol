
#include <Wire.h>
#include <Arduino.h>
#include <IRremote.hpp>

#define AUDIO_Z1_L 12
#define AUDIO_Z1_R 11
#define AUDIO_Z2_L 10
#define AUDIO_Z2_R 9
#define i2c_addr 0x8
#define IR_RECEIVE_PIN 2
#define IR_SEND_AUDIO_PIN 3
#define IR_SEND_TV_PIN 4

char request[30];
int lastIrReceived = NULL;
int sendCode = NULL;
int sendCode_source = 0;

int AudioSwitchIdentifier = 0;
int TvIdentifier = 1;
int HdmiSwitch = 2;

bool lookForIr = 0;
bool sendIrOnce = 0;

bool audioOn = 1;
bool audioOff = 0;

IRrecv irrecv(IR_RECEIVE_PIN);
IRsend irsend_audio(IR_SEND_AUDIO_PIN);
IRsend irsend_tv(IR_SEND_TV_PIN);

void setup() {
  Serial.begin(9600);
  Serial.write("Startup ...");

  Wire.setClock(100000);
  Wire.begin(i2c_addr);

  Wire.onRequest(MasterRequestingInput);
  Wire.onReceive(ReceivedDataFromMaster);

  while (!Serial)
    ;

  pinMode(AUDIO_Z1_L, OUTPUT);
  pinMode(AUDIO_Z1_R, OUTPUT);
  pinMode(AUDIO_Z2_L, OUTPUT);
  pinMode(AUDIO_Z2_R, OUTPUT);

  digitalWrite(AUDIO_Z1_L, HIGH);
  digitalWrite(AUDIO_Z1_R, HIGH);
  digitalWrite(AUDIO_Z2_L, HIGH);
  digitalWrite(AUDIO_Z2_R, HIGH);

  irrecv.enableIRIn();
  irsend_audio.enableIROut(38);
  irsend_tv.enableIROut(38);

  delay(100);
  Serial.println("");
  Serial.println("");
  Serial.println("Beginning Bedroom Slave ...");
  Serial.println("");
  Serial.println("");
}

void loop() {
  if (lookForIr) lookForIrSignal();
  else if (sendIrOnce) {
    sendIrOnce = 0;
    Serial.print("Send ir once ... source: ");
    Serial.print(sendCode_source);
    Serial.print(" - code: <");
    Serial.print(sendCode);
    Serial.println(">");
    if (sendCode != NULL) {
      Serial.print("Sending ir code with source: ");

      switch (sendCode_source) {
      case 0:
        Serial.println("Test, sending ir to audio switch");
        irsend_audio.sendNEC(0x0, sendCode, 10);
        break;
      case 1:
        irsend_tv.sendNEC(0x0, sendCode, 10);
        break;
      case 2:
        Serial.println("Nothing for this yet");
        break;
      default:
        Serial.print("Out of bounds - SendIr - source: ");
        Serial.println(sendCode_source);
        break;
      }
      sendCode = NULL;
    }
  }
  delay(50);
}

// Script Functions
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

// Communication Functions
void MasterRequestingInput() {
  char* req = request;
  String response;

  if (strstr(req, "getAudio")) {
    response = "success/z1-";
    response.concat(digitalRead(AUDIO_Z1_L));
    response.concat("/z2-");
    response.concat(digitalRead(AUDIO_Z2_L));
    response.concat("\0");
  }
  else if (strstr(req, "setAudio")) {
    char z = *((strchr(req, '/') + 2));
    char s = *((strchr(req, '-') + 1));

    if (z == '1' && s == '0') {
      digitalWrite(AUDIO_Z1_L, audioOff);
      digitalWrite(AUDIO_Z1_R, audioOff);
      response = "success\0";
    }
    else if (z == '1') {
      digitalWrite(AUDIO_Z1_L, audioOn);
      digitalWrite(AUDIO_Z1_R, audioOn);
      response = "success\0";
    }
    else if (z == '2' && s == '0') {
      digitalWrite(AUDIO_Z2_L, audioOff);
      digitalWrite(AUDIO_Z2_R, audioOff);
      response = "success\0";
    }
    else if (z == '2') {
      digitalWrite(AUDIO_Z2_L, audioOn);
      digitalWrite(AUDIO_Z2_R, audioOn);
      response = "success\0";
    }
    else if (z != '1' && z != '2') {
      response = "fail-Zrange\0";
    }
    else if (s != '0' && s != '0') {
      response = "fail-Srange\0";
    }
    else {
      response = "fail-nogood\0";
    }

  }
  else if (strstr(req, "newIr")) {
    lastIrReceived = NULL;
    lookForIr = 1;
    response = "success\0";
  }
  else if (strstr(req, "getIr")) {
    if (lastIrReceived == NULL)
      response = "fail\0";
    else
      response = lastIrReceived;
  }
  else if (strstr(req, "sendCommand")) {
    sendCode = NULL;
    char cmd[3];
    int flag_cmd = -1;
    int flag_source = 0;

    for (int i = 0; i < strlen(req); i++) {
      if (flag_cmd >= 0) {
        cmd[flag_cmd] = req[i];
        flag_cmd++;
      }
      else if (flag_source >= 1) {
        if (flag_source >= 3) {
          sendCode_source = atoi(req[i]);
          flag_source = 0;
        }
        flag_source++;
      }
      else if (req[i] == '/') flag_source++;
      else if (req[i] == '-') flag_cmd++;
    }
    cmd[flag_cmd] = '\0';

    if (strlen(cmd) <= 0) {
      response = "fail-cmdNotParsed\0";
    }
    else if (sendCode_source == NULL) {
      response = "fail-srcNotParsed\0"
    }
    else {
      sendCode = atoi(cmd);
      sendIrOnce = 1;
      response = "success\0";
    }
  }
  else response = "fail-OOB!\0";

  // convert string to char array
  int resLen = response.length();
  char res[resLen + 1];
  for (int i = 0; i < resLen; i++)
    res[i] = response[i];
  res[resLen] = '\0';

  Wire.write(res);

  delay(100);
  Serial.println("");
  Serial.print("------ Response to master [");
  Serial.print(res);
  Serial.print("]");
  Serial.println("");

}
void ReceivedDataFromMaster(uint8_t howMany) {
  char* str = request;
  unsigned int i = 0;

  if (howMany < 1) return;

  while (Wire.available()) {
    str[i] = Wire.read();
    i++;
  }

  str[i] = '\0';

  if (howMany < 1) {
    Serial.println("After ... ");
    return;
  }



  Serial.println("");
  Serial.print("-- Inc from master ( ");
  Serial.print(howMany);
  Serial.print(" ) [");
  Serial.print(str);
  Serial.print("]");
}




