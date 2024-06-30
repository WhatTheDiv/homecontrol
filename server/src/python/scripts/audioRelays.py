
from gpiozero import LED
import time

relay_one = LED(19, True, False)
relay_two = LED(20, True, False)

print("Starting script " + sys.argv[1])
try:

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
    
  
except RuntimeError as err:
    print("RuntimeError in - audioRelays.py - :" + err.args[0])

finally:
    print("-------   Script complete    -------")