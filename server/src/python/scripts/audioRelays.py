
from gpiozero import LED
import time
import sys

relay_one = LED(19)
relay_two = LED(20)

zone = sys.argv[1]

print(" ")
print("           Start ... ")
print(" ")
print("Toggling relay, Zone", zone)
try:

    time.sleep(1)

    relay_one.on()
    time.sleep(.5)
    relay_two.on()

    time.sleep(2)

    relay_one.off()
    time.sleep(.5)
    relay_two.off()

    time.sleep(2)

    relay_one.on()
    time.sleep(.5)
    relay_two.on()

    time.sleep(2)

    relay_one.off()
    time.sleep(.5)
    relay_two.off()

    time.sleep(1)
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0])

finally:
    print(" ")
    print("-------   Script complete    -------")