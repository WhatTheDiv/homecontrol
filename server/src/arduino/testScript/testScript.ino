#include <Adafruit_NeoPixel.h>
#include <Wire.h>

#define LED_PIN 2
#define LED_COUNT 200
#define i2c_addr 0x8
// Living room count: 90
// Kitchen count: 110

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

void setup() {
   Serial.begin(9600);
   while (!Serial){;}
   Wire.begin(i2c_addr);
   Wire.onReceive(receiveInput);
   strip.begin();
   strip.show();
   Serial.println(" ");
   Serial.println(" ");
   Serial.println(" ");
   Serial.println(" ");
   Serial.println("Script Begin.");
   Serial.println(" ");
   delay(100);
}

void loop() {
  uint32_t orange_color = strip.Color(255,40,0,0);
  uint32_t dim_orange_color = strip.Color(40,10,0,0);
  uint32_t white_color = strip.Color(0,0,0,50);
  uint32_t off_color = strip.Color(0,0,0,1);
  
  // animate_sequence(300);
  // animate_bounce(white_color, 75, -1);
  animate_walk(white_color, off_color, 7, 10, 45, -1);

  cleanup();
  
  exit(0);
}
void animate_sequence(byte timeout){
  Serial.println("Setting strip to red ");
    for(int x = 0; x < LED_COUNT; x++){
      strip.setPixelColor(x, 255, 0, 0, 0);
      strip.show();
      delay(timeout);
    }

    Serial.println("Setting strip to green ");
    for(int x = 0; x < LED_COUNT; x++){
      strip.setPixelColor(x, 0, 255, 0, 0);
      strip.show();
      delay(timeout);
    }

    Serial.println("Setting strip to blue ");
    for(int x = 0; x < LED_COUNT; x++){
      strip.setPixelColor(x, 0, 0, 255, 0);
      strip.show();
      delay(timeout);
    }

    Serial.println("Setting strip to white ");
    for(int x = 0; x < LED_COUNT; x++){
      strip.setPixelColor(x, 0, 0, 0, 255);
      strip.show();
      delay(timeout);
    }

    Serial.println("Turning all off ");
    for(int x = 0; x < LED_COUNT; x++){
      strip.setPixelColor(x, 0, 0, 0, 0);
      strip.show();
      delay(timeout);
    }

    Serial.println(" ");
    Serial.println(" ");
    Serial.println("Sequence complete!");
    delay(100);
}
void animate_bounce(uint32_t color, uint16_t initialDelay, unsigned short seconds_duration){
  unsigned long start = millis();
  unsigned long finish;

  if(seconds_duration == -1){
    Serial.println("-- Infinite Script -- ");
    finish = -1;
  }
  else{
    finish = start + (1000L * seconds_duration);
  }

  uint16_t newDelay = initialDelay;
  uint8_t minDelay = 5;
  uint16_t maxDelay = initialDelay;
  bool ascending = false;
  
  while (true){
    for (int x = 0; x < LED_COUNT; x++){
      setLights(x, color, newDelay);
      newDelay = setNewDelay(ascending, newDelay);
      ascending = setAscending(ascending, newDelay, minDelay, maxDelay);
    }

    for (int x = LED_COUNT-2; x > 0; x--){
      setLights(x, color, newDelay);
      newDelay = setNewDelay(ascending, newDelay);
      ascending = setAscending(ascending, newDelay, minDelay, maxDelay);
    }

    unsigned long now = millis(); 

    
    if(finish >= 0 && now >= finish){
      break;
    }
    else if(finish == -1){
      continue;
    }
    else {
      Serial.print("Duration remaining: ");
      Serial.print(round((finish - now) / 1000));
      Serial.println(" seconds.");
      continue;
    }
    break;
  }
  
}
void animate_walk(uint32_t color, uint32_t off_color, uint8_t size, uint8_t edge_Remain, uint16_t del, unsigned short seconds){
  unsigned long finishedAt_millis = getFinish(seconds);

  strip.fill(off_color, 0);
  strip.show();

  for( int i = 0; i < edge_Remain; i++){
    strip.setPixelColor(i,color);
    strip.show();
    delay(del);
  }

  while ( shouldContinue(finishedAt_millis) ){
    walk_up(color, off_color, del, size, edge_Remain);
    walk_down(color, off_color, del, size, edge_Remain);
  }

}
void walk_up(uint32_t color, uint32_t off_color, uint16_t del, uint8_t size, uint8_t edge_Remain ){
    for( int i = edge_Remain; i < size; i++){
      strip.setPixelColor(i,color);
      strip.show();
      delay(del);
    }

    for( int i = size; i < LED_COUNT; i++){
      strip.setPixelColor(i-size,off_color);
      strip.setPixelColor(i,color);
      strip.show();
      delay(del);
    }

    for( int i = size; i > edge_Remain; i--){
      strip.setPixelColor(LED_COUNT-i,off_color);
      strip.show();
      delay(del);
    }

}
void walk_down(uint32_t color, uint32_t off_color, uint16_t del, uint8_t size, uint8_t edge_Remain ){
  for( int i = LED_COUNT-edge_Remain; i >= LED_COUNT-size; i--){
    strip.setPixelColor(i, color);
    strip.show();
    delay(del);
  }

  for( int i = LED_COUNT-size; i >= 0; i--){
    strip.setPixelColor(i, color);
    strip.setPixelColor(i+size, off_color);
    strip.show();
    delay(del);
  }

  for( int i = size; i > edge_Remain; i--){
    strip.setPixelColor(i, off_color);
    strip.show();
    delay(del);
  }
}


void setLights(uint8_t n, uint32_t c, uint16_t d){
  strip.clear();
  strip.setPixelColor(n,c);
  strip.show();
  delay(d);
}
uint16_t setNewDelay(bool ascending, uint16_t newDelay){
  
  if(ascending){
    uint16_t f = ceil(newDelay * 1.2);
    // Serial.println("New delay " + String(f) );
    return f;
  }
  else{
    uint16_t f = floor(newDelay * .98);
    // Serial.println("New delay " + String(f) );
    return f;
  }
}
bool setAscending(bool ascending, uint16_t newDelay, uint8_t minDelay, uint16_t maxDelay){
  if(ascending && newDelay >= maxDelay){
    // Serial.println("Switching ascending to false");
    return false;
  }
  else if(!ascending && newDelay <= minDelay){
    // Serial.println("Switching ascending to true");
    return true;
  }
  else return ascending;
}
bool shouldContinue(unsigned long finish){
  unsigned long now = millis(); 

  if(finish >= 0 && now >= finish){
    Serial.println("Wrapping up ... ");
    return false;
  }
  else if(finish == -1){
    return true;
  }
  else {
    Serial.println("Duration remaining: " + String(round((finish - now) / 1000)) + " seconds.");
    return true;
  }
}
unsigned long getFinish(unsigned short seconds_duration){
  if(seconds_duration == -1){
    Serial.println("-- Infinite Script -- ");
    return -1;
  }
  else{
    return millis() + (1000L * seconds_duration);
  }
}

void receiveInput(int howMany){
  uint16_t count = 0;
  char str[howMany];

  while(Wire.available()){
    byte l = Wire.read();

    if(count != 0){
      str[count-1] = char(l);
    }

    count++;
  }

  str[howMany-1] = '\0';

  Serial.println("Got from master: '" + String(str) + "'" );


}
void processInput(){

  return;
}
void cleanup(){
  Serial.println(" ");
  Serial.print("Clearing strip ... ");

  strip.fill(strip.Color(0,0,0,50),0);
  strip.show();
  delay(400);

  strip.fill(strip.Color(0,0,0,0),0);
  strip.show();

  Serial.println("Cleared.");
  Serial.println("Script ran for " + String(round(millis() / 1000)) + " Seconds.");

  delay(200);
}
