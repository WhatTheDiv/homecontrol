
from gpiozero import LED
import time
import sys

def turnZoneOn(zone):
  currState = zone_one_L.is_lit
  print("Zone ",zone,"currently lit? ",currState)
  

print(" ")
print("-------   Starting Script   -------")
print(" ")

zone = sys.argv[1]
state = sys.argv[2]

zone_one_L = LED(pin=18, initial_value=False)
zone_one_R = LED(pin=19, initial_value=False)

zone_two_L = LED(pin=20, initial_value=False)
zone_two_R = LED(pin=21, initial_value=False)

try:
    if len(sys.argv <= 1)
        raise Exception(" Not given zone and state")
        
    time.sleep(.25)

    print("Toggling relay, Zone", zone, "-",state)
    
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0])

finally:
    print(" ")
    print("-------   Script complete    -------")
    print(" ")