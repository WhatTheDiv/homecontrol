
from gpiozero import LED
import time
import sys

def turnZoneOn(zone, set_active):
  if zone == 1:
      currState = zone_one_L.is_lit
      print("Zone 1 currently", currState)
      if currState == set_active:
          print(" new state matches current, doing nothing ")
          return currState
      elif set_active == True:
          zone_one_L.on()
          zone_one_R.on()
      elif set_active == False:
          zone_one_L.off()
          zone_one_R.off()
  elif zone == 2:
      currState = zone_two_L.is_lit
      print("Zone 2 currently", currState)
      if currState == set_active:
          print(" new state matches current, doing nothing ")
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

zone_one_L = LED(pin=18)
zone_one_R = LED(pin=19)

zone_two_L = LED(pin=20)
zone_two_R = LED(pin=21)

try: 
    time.sleep(1)

    print("Toggling relay, Zone", zone, "- Active:",state)
    print("NewState Active?",turnZoneOn(zone, state))
    time.sleep(2)
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0])

finally:
    print(" ")
    print("-------   Script complete    -------")
    print(" ")