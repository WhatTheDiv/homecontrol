install python environment

install DHT22 library for RPi5
 - (venv) $ pip3 install adafruit-circuitpython-dht

 - DHT22 - Board 17

 - pip3 install smbus2




 lights:

 functions:
  turn lights off ( zone, ... )
  turn lights on ( zone, ... )
  set animation 
  set color ( off_color, main_color, ...)



states to maintain
state: {
      lights_active: false,
      animation_active: false,
      animation: 'walk',
      updated: false,
    },

toggle lights ->

  lights active
    - fade_on
    - slide_on
    - turn_on
    - any animation

  lights inactive
    - fade_off
    - slide_off
    - turn_off
    
set animation -> 

  walk 
