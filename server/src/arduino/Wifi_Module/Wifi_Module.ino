#include <ESP8266WiFi.h>
#include <Wire.h>
#include <Arduino.h>
#define ONBOARD_RED_LED 0
#define ONBOARD_BLUE_LED 2
#define i2c_addr 0x24
#define i2c_bedroom_slave 0x8

const char* ssid = "The Internet";
const char* password = "Patcannon1!";
const uint16_t port = 80;

bool establishedClient = 0;
String request = "";

IPAddress staticIP(192, 168, 2, 116);
IPAddress gateway(192, 168, 2, 1);
IPAddress subnet(255, 255, 255, 0);

WiFiServer server(port);
WiFiClient client;

void setup() {
  Serial.begin(9600);
  delay(100);

  pinMode(ONBOARD_RED_LED, OUTPUT);
  digitalWrite(ONBOARD_RED_LED, HIGH);

  pinMode(ONBOARD_BLUE_LED, OUTPUT);
  digitalWrite(ONBOARD_BLUE_LED, HIGH);

  while (!Serial)
    ;

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  Wire.setClock(100000);
  Wire.begin();
  WiFi.config(staticIP, gateway, subnet);
  WiFi.hostname("IoTModule");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    flashLED(200, 100, ONBOARD_RED_LED);
  }

  digitalWrite(ONBOARD_BLUE_LED, HIGH);
  digitalWrite(ONBOARD_RED_LED, LOW);
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Netmask: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());



  server.begin();

  Serial.print("");
  Serial.print("Ready to accept clients ... ");

}

void loop() {
  client = server.accept();

  if (client) {
    uint8_t len;
    flashLED(50, 50, ONBOARD_BLUE_LED);
    while (client.connected()) {
      if (client.available()) {
        String line = client.readStringUntil('\r');

        if (line.indexOf("content-length") >= 0) {
          char length[2];
          int start = line.indexOf(":");

          length[0] = line[start += 2];
          length[1] = line[start += 1];

          if (length[1] == ' ') len = length[0];
          else len = atol(length);
        }
        if (line.length() == 1 && line[0] == '\n') break;
      }
    }

    char str[len - 1];

    client.read();
    uint8_t i = 0;

    while (client.available()) {
      char c = client.read();
      if (c != '"') {
        str[i] = c;
        i++;
      }
    }

    str[i] = '\0';

    client.read();

    Wire.beginTransmission(i2c_bedroom_slave);
    Wire.write(str, len - 1);
    Wire.endTransmission(0);
    Wire.requestFrom(i2c_bedroom_slave, 30);

    while (!Wire.available())
      delay(50);

    char rcv[Wire.available()];
    uint8_t j = 0;

    while (Wire.available() > 0) {
      byte l = Wire.read();
      if (l != 255) {
        rcv[j] = l;
        j++;
      }
      else {
        rcv[j] = '\0';
        break;
      }
    }

    // Clear empty bytes remaining
    while (Wire.available() > 0) { Wire.read(); }

    Wire.endTransmission();
    client.println(prepareResponse(rcv, j + 1));
    client.stop();

    flashLED(100, 50, ONBOARD_BLUE_LED);
    Serial.print("From arduino: ");
    Serial.print(rcv);
    Serial.println("");
  }
  else {
    delay(50);
  }
}

String prepareResponse(char _rcv[], int len) {
  char rcv[len];

  for (int i = 0; i < len; i++) {
    if (_rcv[i] == '\0') {
      rcv[i] = '\0';
      break;
    }
    rcv[i] = _rcv[i];
  }

  String htmlPage;
  htmlPage.reserve(1024);               // prevent ram fragmentation
  htmlPage = F("HTTP/1.1 200 OK\r\n"
    "Content-Type: text/plain\r\n"
    "Connection: close\r\n"  // the connection will be closed after completion of the response
    "\r\n"
  );

  htmlPage += String(_rcv);

  return htmlPage;
}
void flashLED(uint32_t duration_millis, uint16_t perFlashCycle_millis, uint8_t led) {
  uint32_t _dur = duration_millis;
  uint16_t _perFlash;
  uint16_t _stateChangeInterval;
  bool _originalState = digitalRead(led);

  if (perFlashCycle_millis > _dur) _dur = perFlashCycle_millis;

  _perFlash = round(perFlashCycle_millis * .5);

  unsigned long _now = millis();
  unsigned _finished = _now + _dur;

  while (_now < _finished) {
    digitalWrite(led, HIGH);
    delay(_perFlash);
    digitalWrite(led, LOW);
    delay(_perFlash);
    _now = millis();
  }

  digitalWrite(led, _originalState);
}
