
from gpiozero import LED
import time
import sys

def turnZoneOn(zone, set_active):
  if zone == 1:
      currState = zone_one_L.is_lit
      if currState == set_active:
          return
      elif set_active == True:
          zone_one_L.on()
          zone_one_R.on()
      elif set_active == False:
          zone_one_L.off()
          zone_one_R.off()
  elif zone == 2:
      currState = zone_two_L.is_lit
      if currState == set_active:
          return
      elif set_active == True:
          zone_two_L.on()
          zone_two_R.on()
      elif set_active == False:
          zone_two_L.off()
          zone_two_R.off()

  return set_active


  print("Zone ",zone,"currently lit? ",currState)
  

print(" ")
print("-------   Starting Script   -------")
print(" ")

if len(sys.argv) <= 2:
      raise Exception(" Not given zone and state")

zone = sys.argv[1]
state = sys.argv[2]

zone_one_L = LED(pin=18, initial_value=False)
zone_one_R = LED(pin=19, initial_value=False)

zone_two_L = LED(pin=20, initial_value=True)
zone_two_R = LED(pin=21, initial_value=True)

try: 
    time.sleep(1)

    print("Toggling relay, Zone", zone, "-",state)
    print("NewState, is active?",turnZoneOn(zone, state))
    
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0])

finally:
    print(" ")
    print("-------   Script complete    -------")
    print(" ")