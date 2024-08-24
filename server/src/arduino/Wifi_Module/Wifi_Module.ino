#include <ESP8266WiFi.h>
#define ONBOARD_LED 0

const char* ssid = "The Internet";
const char* password = "Patcannon1!";
const uint16_t port = 80;
bool establishedClient = 0;

IPAddress staticIP(192, 168, 2, 116);
IPAddress gateway(192, 168, 2, 1);
IPAddress subnet(255, 255, 255, 0);

WiFiServer server(port);
WiFiClient client;

void setup() {
  Serial.begin(9600);
  delay(100);
  pinMode(ONBOARD_LED, OUTPUT);

  // We start by connecting to a WiFi network

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.config(staticIP, gateway, subnet);
  WiFi.hostname("IoTModule");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    flashLED(1, 200);
  }

  digitalWrite(0, LOW);
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

  if (!establishedClient) {
    Serial.println("Checking for clients ... ");
    client = server.accept();
    flashLED(2, 2000);

    if (client && client.connected()) {
      client.write("checkpoint");
        Serial.println("Made connection with client...");
      flashLED(2, 100);
      digitalWrite(ONBOARD_LED, LOW);
      establishedClient = 1;
    }
    else if (client) {
      Serial.println("Failed to connect to client.");
      flashLED(4, 4000);
    }
  }
  else {
    Serial.println("Connection with client established");
    delay(5000);
  }

}

void flashLED(unsigned long duration_seconds, uint16_t perFlashCycle_millis) {
  uint16_t _dur;
  uint16_t _perFlash;
  uint16_t _stateChangeInterval;


  if (perFlashCycle_millis > (duration_seconds * 1000)) {
    _dur = perFlashCycle_millis;
  }
  else {
    _dur = duration_seconds * 1000;
  }

  _perFlash = round(perFlashCycle_millis * .5);

  unsigned long _now = millis();
  unsigned _finished = _now + _dur;

  while (_now < _finished) {
    digitalWrite(ONBOARD_LED, HIGH);
    delay(_perFlash);
    digitalWrite(ONBOARD_LED, LOW);
    delay(_perFlash);
    _now = millis();
  }
}
