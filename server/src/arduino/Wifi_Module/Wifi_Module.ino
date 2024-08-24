#include <ESP8266WiFi.h>
#define ONBOARD_LED 0

const char* ssid = "The Internet";
const char* password = "Patcannon1!";
const uint16_t port = 80;

IPAddress staticIP(192, 168, 2, 116);
IPAddress gateway(192, 168, 2, 1);
IPAddress subnet(255, 255, 255, 0);

WiFiServer server(port);

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
  WiFiClient client = server.accept();

  if (!client) {
    Serial.println("No clients available ... ");
    flashLED(2, 2000);

  }

}


// void _loop() {
//   delay(6000);

//   Serial.print("connecting to ");
//   Serial.println(host);

//   // Use WiFiClient class to create TCP connections
//   WiFiClient client;
//   const int httpPort = 3000;
//   if (!client.connect(host, httpPort)) {
//     Serial.println("connection failed");
//     return;
//   }

//   // We now create a URI for the request
//   String url = "/espTest";
//   Serial.print("Requesting URL: ");
//   Serial.println(url);

//   // This will send the request to the server
//   client.print(String("GET ") + url + " HTTP/1.1\r\n" +
//     "Host: " + host + "\r\n" +
//     "Connection: close\r\n\r\n");
//   delay(500);

//   // Read all the lines of the reply from server and print them to Serial
//   while (client.available()) {
//     String line = client.readStringUntil('\r');
//     Serial.print(line);
//   }

//   Serial.println();
//   Serial.println("closing connection");
// }
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
