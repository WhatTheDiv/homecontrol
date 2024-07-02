
from gpiozero import LED
import time
import sys
import select
from signal import pause

def turnZoneOn(zone, set_active, z1L, z1R, z2L, z2R):
  if zone == 1:
      currState = zone_one_L.is_lit
      print("Zone 1 currently", currState)
      if str(currState) == str(set_active):
          print(" new state matches current, doing nothing ")
          return currState
      elif str(set_active) == 'True':
          print(f'setting zone 1 to True')
          z1L.on()
          z1R.on()
      elif str(set_active) == 'False':
          print(f'setting zone 1 to False')
          z1L.off()
          z1R.off()
  elif zone == 2:
      currState = zone_two_L.is_lit
      print("Zone 2 currently", currState)
      if str(currState) == str(set_active):
          print(" new state matches current, doing nothing ")
          return
      elif set_active == 'True':
          z2L.on()
          z2R.on()
      elif set_active == 'False':
          z2L.off()
          z2R.off()
  else: 
      print("out of bounds", zone)

  print(f"Zone {zone} currently lit? {currState}")
  return set_active


  

print(" ")
print("-------   Starting AudioRelays.py   -------")
print(" ", flush=True)

try: 
    z_1_L = LED(pin=18, initial_value=True)
    z_1_R = LED(pin=19, initial_value=True)

    z_2_L = LED(pin=20, initial_value=True)
    z_2_R = LED(pin=21, initial_value=True)

    while True:
        result = chewInput( sys.stdin.readline() )
        print(f'result:{result}', flush=True)
        if ( result == False):
            print('breaking ... ',flush=True)
            break
        time.sleep(1)



    while True:
        inp = sys.stdin.readline()

        if inp.strip() == 'q':
            print('quitting-',flush=True)
            break
        elif bool(inp.strip() == False)
            break
        else:
            print(f'Got input -{inp}',flush=True)


      
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0], flush=True)

finally:
    print(" ")
    print("-------   Script Terminated    -------")
    print(" ", flush=True)