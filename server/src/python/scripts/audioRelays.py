
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
print("-------   Starting Script   -------", sys.argv[2])
print(" ")

if len(sys.argv) <= 2:
      raise Exception(" Not given zone and state")

zone = int(sys.argv[1])
state = sys.argv[2]

zone_one_L = LED(pin=18)
zone_one_R = LED(pin=19)

zone_two_L = LED(pin=20)
zone_two_R = LED(pin=21)

try: 

    print("Toggling relay, Zone", zone, "- Requesting new active state:",state)
    print("New active state now?", turnZoneOn(zone, state, zone_one_L, zone_one_R, zone_two_L,zone_two_R), flush=True)
    
    print('cp',flush=True)
    time.sleep(1)


    print('start',flush=True)
    while True:
      try:
          text = ''
          for line in sys.stdin:
              text += line
          if text != '':
              print(f'Finished reading - "{text}"', flush=True)
          else:
              print('...', flush=True)
          time.sleep(1)
      except:
          print('Errored out in loop', flush=True)
          time.sleep(1)
          pass
      

    # print(f'cp {sys.stdin.read()}',flush=True)

    # for line in sys.stdin:
    #     print('has line', flush=True)
    #     print('readline 1:'+line.rstrip(), flush=True)
        
    
    # print('5 ... ', flush=True)
    # time.sleep(5)

    # for line in sys.stdin:
    #     print('readline 2:',sys.stdin.readline(), flush=True)


    # while True:

    #     if(len(sys.stdin.readline()) > 0):
    #             print('got stdin: ', line.strip() , flush=True)
    #     else: 
            
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0], flush=True)

finally:
    print(" ")
    print("-------   Script complete    -------")
    print(" ", flush=True)