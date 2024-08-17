#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <Arduino.h>

#define LED_PIN 5
#define LED_COUNT 200 // 200
#define i2c_addr 0x8

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

uint32_t color_primary = strip.Color(0, 0, 0, 50);
uint32_t color_secondary = strip.Color(0, 0, 0, 1);
uint32_t color_off = strip.Color(0, 0, 0, 0);
uint8_t col_r = 255; // actually green
uint8_t col_g = 40;  // actually red   - grr
uint8_t col_b = 0;
uint8_t col_w = 0;
bool active = true;
bool interrupt = false;
bool initial = true;
bool lightsOn = true;
String command = "[task=getState]";
String animation = "fade_on";
uint16_t brightness = 255;

void setup()
{
  Serial.begin(9600);
  while (!Serial)
  {
    ;
  }
  Wire.begin(i2c_addr);
  Wire.onRequest(requestInput);
  Wire.onReceive(receiveInput);
  strip.begin();
  Serial.println("Beginning RGB automator");
  Serial.println("Resetting strip color ... ");
  strip.fill(color_off, 0);
  strip.show();
  delay(100);
}

void loop()
{
  checkInput();
  delay(3000);
}

//                                                            Modifiers
bool set_animation(char _animationId)
{
  Serial.print("Setting animation with id: ");
  Serial.println(_animationId);
  Serial.flush();
  // interrupt = true;
  active = true;
  initial = true;
  delay(300);

  if (_animationId == '0')
  {
    Serial.println("Setting animation to 'walk'");
    animation = "walk";
    lightsOn = true;
  }
  else if (_animationId == '1')
  {
    Serial.println("Toggling lights to 'On' with slide on");
    animation = "slide_on";
    lightsOn = true;
  }
  else if (_animationId == '2')
  {
    Serial.println("Toggling lights to 'On' with fade in");
    animation = "fade_on";
    lightsOn = true;
  }
  else if (_animationId == '3')
  {
    Serial.println("Toggling lights to 'Off' with fade out");
    animation = "fade_off";
    lightsOn = false;
  }
  else if (_animationId == '4')
  {
    Serial.println("Setting animation to 'spot'");
    animation = "spot";
    lightsOn = true;
  }
  else
  {
    return false;
  }

  return true;
}

//                                                            Input Functions
void requestInput()
{
  Serial.println("Input requested");
  Serial.print("Command: ");
  Serial.println(command);
  Serial.flush();

  const uint16_t len = command.length();
  char cmd[len];
  uint16_t index_cmdEnd;

  command.toCharArray(cmd, len);

  for (uint16_t i = 0; i < len; i++)
  {
    if (cmd[i] == '=')
    {
      index_cmdEnd = i;
      break;
    }
  }

  String cmdString = cmd.substring(1, index_cmdEnd);

  if (cmdString == "setAnim")
  {
    Serial.println(command);
  }
  else if (cmdString == "setColor")
  {
    Serial.println(command);
  }
  else if (cmdString == "getState")
  {
    Serial.println("Master requesting state ... ");

    // [S:0,A:2]
    // State = active, Animation: slide_on

    char message[10] = "[S:";

    if (lightsOn == true)
    {
      strcat(message, "1");
    }
    else if (lightsOn == false)
    {
      strcat(message, "0");
    }

    strcat(message, ",A:");

    if (animation == "walk")
    {
      strcat(message, "0");
    }
    else if (animation == "slide_on")
    {
      strcat(message, "1");
    }
    else if (animation == "fade_on")
    {
      strcat(message, "2");
    }
    else if (animation == "fade_off")
    {
      strcat(message, "3");
    }
    else if (animation == "spot")
    {
      strcat(message, "4");
    }
    else
    {
      strcat(message, "-1");
      Serial.println("arduino out of bounds in request input");
    }

    strcat(message, "]");

    Wire.write(message);
  }
  else
  {
    Serial.println("Out of bounds, request input bad command");
  }
}
void receiveInput(int howMany)
{
  Serial.println("receiveInput ...");

  uint16_t count = 0;
  char str[howMany];

  while (Wire.available())
  {
    byte l = Wire.read();

    if (count != 0)
    {
      str[count - 1] = char(l);
    }

    count++;
  }
  str[howMany - 1] = '\0';

  Serial.println("Input: ");
  Serial.println(str[2]);

  processInput(str, howMany);
}
void checkInput()
{
  if (Serial.available() > 0)
  {
    Serial.print("Serial buffer available ");

    String s = Serial.readString();
    int16_t len = s.length() - 1;
    char str[len];

    Serial.print("( Len:");
    Serial.print(len);
    Serial.print(") - ");
    Serial.println(s);

    s.toCharArray(str, len);
    str[len - 1] = '\0';

    processInput(str, len);
  }
}
void processInput(char inp[], uint16_t howMany)
{
  Serial.print("Input: ");
  Serial.println(inp);
  Serial.flush();
  delay(600);

  uint8_t action_index;
  char action;

  for (uint16_t i = 0; i < howMany - 1; i++)
  {
    if (inp[i] == '&')
    {
      action_index = i + 1;
      break;
    }
  }

  action = inp[action_index];

  Serial.print("Action: ");
  Serial.println(action);
  Serial.flush();

  if (action == 'a')
  {
    Serial.println("checkpoint");
    Serial.flush();
    command = "setAnimation";
    if (set_animation(inp[action_index + 1]))
    {
      command = "[task=setAnim,success=true]";
    }
    else
    {
      command = "[task=setAnim,success=false]";
    }
    return;
  }
  else if (action == 's')
  {
    command = "[task=getState]";
  }
  // else if(action == "c"){
  //   //   i = inp.indexOf("(");
  //   //   uint8_t j = inp.indexOf("-");

  //   //   String colorName = inp.substring( j + 1, inp.indexOf("("));
  //   //   String col = inp.substring(i+1, inp.indexOf(")"));

  //   //   i = col.indexOf(",");
  //   //   uint8_t red = (col.substring(0, i)).toInt();
  //   //   j = i;

  //   //   i = col.indexOf(",",i+1);
  //   //   uint8_t blue = (col.substring(j+1, i)).toInt();
  //   //   j = i;

  //   //   i = col.indexOf(",", i+1);
  //   //   uint8_t green = (col.substring(j+1, i)).toInt();
  //   //   j = i;

  //   //   i = col.indexOf(",", i+1);
  //   //   uint8_t white = (col.substring(j+1, i)).toInt();
  //   //   j = i;

  //   //   Serial.println("Setting color: { r:"+String(red)+", g:"+String(green)+", b:"+String(blue)+", w:"+String(white)+" }");

  //   //   if(colorName == "primary"){
  //   //     color_primary = strip.Color(red,blue,green,white);
  //   //   }
  //   //   else if(colorName == "secondary"){
  //   //     color_secondary = strip.Color(red,blue,green,white);
  //   //   }
  //   //   else if(colorName == "off"){
  //   //     color_off = strip.Color(red,blue,green,white);
  //   //   }
  //   //   else {
  //   //     Serial.println("Colorname not identifiable");
  //   //   }

  //   // }

  // else if(action == 's'){
  //   Serial.println("hitting 's'");
  //   command = "getState";
  // }
  else
  {
    Serial.print("Could not process input ");
    Serial.println(inp);
    Serial.flush();
  }
}

/*

  Input Format:

  ( action ) ::: Looks for single character after '&' symbol
      - options:
              "a"   -   Set animation to received animation ID
                            0 - "walk"
                            1 - "slide_on"
                            2 - "fade_on"
                            3 - "fade_off"
                            4 - "spot"
                    -   modifies (command) to send back success flag

              "c"   -   Set color of RGB
                    -   modifies (command) to send back success flag

              "s"   -   modifies (command) to send back state



  Response Format:

  ( comand ) ::: Sets when request input, prepares for response
              Set animation   -   "[task=setAnim,success=true]"
              Set color       =   "[task=setColor,success=true]"
              Get state       -   "[task=getState]"


  */